"use client";

import { FileUpload } from "@/components/application/file-upload/file-upload-base";


export default function UserHome() {
  return (
    <>
      <h1>Welcome to User Home</h1>
      <FileUpload.Root>
        <FileUpload.DropZone />

        <FileUpload.List>
          <FileUpload.ListItemProgressBar />
        </FileUpload.List>
      </FileUpload.Root>
    </>
  )
};