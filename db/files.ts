import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"
import mammoth from "mammoth"
import { toast } from "sonner"
import { uploadFile } from "./storage/files"

const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error)
  throw new Error(error.message || "An unexpected error occurred")
}

export const getFileById = async (fileId: string) => {
  const { data: file, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single()

  if (error) handleSupabaseError(error)
  if (!file) throw new Error("File not found")

  return file
}

export const getFileWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(`id, name, files (*)`)
    .eq("id", workspaceId)
    .single()

  if (error) handleSupabaseError(error)
  if (!workspace) throw new Error("Workspace not found")

  return workspace
}

export const getFileWorkspacesByFileId = async (fileId: string) => {
  const { data: file, error } = await supabase
    .from("files")
    .select(`id, name, workspaces (*)`)
    .eq("id", fileId)
    .single()

  if (error) handleSupabaseError(error)
  if (!file) throw new Error("File not found")

  return file
}

export const createFileBasedOnExtension = async (
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase()

  if (fileExtension === "docx") {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return createDocXFile(result.value, file, fileRecord, workspace_id, embeddingsProvider)
  } else {
    return createFile(file, fileRecord, workspace_id, embeddingsProvider)
  }
}

const sanitizeFilename = (filename: string, maxLength: number = 100): string => {
  let validFilename = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase()
  const extension = validFilename.split(".").pop() || ""
  const baseName = validFilename.substring(0, validFilename.lastIndexOf("."))
  const maxBaseNameLength = maxLength - extension.length - 1
  
  if (baseName.length > maxBaseNameLength) {
    return `${baseName.substring(0, maxBaseNameLength)}.${extension}`
  }
  return validFilename
}

export const createFile = async (
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  fileRecord.name = sanitizeFilename(fileRecord.name)
  
  const { data: createdFile, error } = await supabase
    .from("files")
    .insert([fileRecord])
    .select("*")
    .single()

  if (error) handleSupabaseError(error)
  if (!createdFile) throw new Error("Failed to create file record")

  try {
    await createFileWorkspace({
      user_id: createdFile.user_id,
      file_id: createdFile.id,
      workspace_id
    })

    const filePath = await uploadFile(file, {
      name: createdFile.name,
      user_id: createdFile.user_id,
      file_id: createdFile.id
    })

    await updateFile(createdFile.id, { file_path: filePath })

    const formData = new FormData()
    formData.append("file_id", createdFile.id)
    formData.append("embeddingsProvider", embeddingsProvider)

    const response = await fetch("/api/retrieval/process", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const jsonText = await response.text()
      const json = JSON.parse(jsonText)
      throw new Error(`Failed to process file. Reason: ${json.message}`)
    }

    return await getFileById(createdFile.id)
  } catch (error) {
    console.error("Error in createFile:", error)
    await deleteFile(createdFile.id)
    throw error
  }
}

export const createDocXFile = async (
  text: string,
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  const { data: createdFile, error } = await supabase
    .from("files")
    .insert([fileRecord])
    .select("*")
    .single()

  if (error) handleSupabaseError(error)
  if (!createdFile) throw new Error("Failed to create file record")

  try {
    await createFileWorkspace({
      user_id: createdFile.user_id,
      file_id: createdFile.id,
      workspace_id
    })

    const filePath = await uploadFile(file, {
      name: createdFile.name,
      user_id: createdFile.user_id,
      file_id: createdFile.id
    })

    await updateFile(createdFile.id, { file_path: filePath })

    const response = await fetch("/api/retrieval/process/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        fileId: createdFile.id,
        embeddingsProvider,
        fileExtension: "docx"
      })
    })

    if (!response.ok) {
      const jsonText = await response.text()
      const json = JSON.parse(jsonText)
      throw new Error(`Failed to process file. Reason: ${json.message}`)
    }

    return await getFileById(createdFile.id)
  } catch (error) {
    console.error("Error in createDocXFile:", error)
    await deleteFile(createdFile.id)
    throw error
  }
}

export const createFiles = async (
  files: TablesInsert<"files">[],
  workspace_id: string
) => {
  const { data: createdFiles, error } = await supabase
    .from("files")
    .insert(files)
    .select("*")

  if (error) handleSupabaseError(error)
  if (!createdFiles) throw new Error("Failed to create file records")

  await createFileWorkspaces(
    createdFiles.map(file => ({
      user_id: file.user_id,
      file_id: file.id,
      workspace_id
    }))
  )

  return createdFiles
}

export const createFileWorkspace = async (item: {
  user_id: string
  file_id: string
  workspace_id: string
}) => {
  const { data: createdFileWorkspace, error } = await supabase
    .from("file_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) handleSupabaseError(error)
  if (!createdFileWorkspace) throw new Error("Failed to create file workspace")

  return createdFileWorkspace
}

export const createFileWorkspaces = async (
  items: { user_id: string; file_id: string; workspace_id: string }[]
) => {
  const { data: createdFileWorkspaces, error } = await supabase
    .from("file_workspaces")
    .insert(items)
    .select("*")

  if (error) handleSupabaseError(error)
  if (!createdFileWorkspaces) throw new Error("Failed to create file workspaces")

  return createdFileWorkspaces
}

export const updateFile = async (
  fileId: string,
  file: TablesUpdate<"files">
) => {
  const { data: updatedFile, error } = await supabase
    .from("files")
    .update(file)
    .eq("id", fileId)
    .select("*")
    .single()

  if (error) handleSupabaseError(error)
  if (!updatedFile) throw new Error("Failed to update file")

  return updatedFile
}

export const deleteFile = async (fileId: string) => {
  const { error } = await supabase.from("files").delete().eq("id", fileId)

  if (error) handleSupabaseError(error)

  return true
}

export const deleteFileWorkspace = async (
  fileId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("file_workspaces")
    .delete()
    .eq("file_id", fileId)
    .eq("workspace_id", workspaceId)

  if (error) handleSupabaseError(error)

  return true
}