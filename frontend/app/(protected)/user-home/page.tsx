'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import Box from '@mui/material/Box';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import Navbar from "@/components/Navbar";
import { useAuthStore } from '@/app/store/authStore';

type UserDocument = {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export default function UserHome() {
  const [userDocs, setUserDocs] = useState<UserDocument[]>([]);
  const apiRef = useGridApiRef();
  const router = useRouter();

  const userToken = useAuthStore.getState().accessToken;

  const container = document.createElement('div');

  const quill = new Quill(container, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'code-block'],
      ],
    },
    placeholder: 'Write something...',
  });

  const createNewDocument = () => {
    router.push('/doc-editor');
  };

  const saveImportedDocument = async (fileName: string, content: object) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-doc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: fileName,
          content: (content) ? content : []
        })
      });

      if (!response.ok) {
        throw new Error(`API Error!`);
      }

      const data = await response.json();
      setUserDocs(prevUserDocs => [...prevUserDocs, data.document]);
    } catch (err) {
      console.log(err);
    }
  }

  const openDocument = async (event: any, doc: any) => {
    event.stopPropagation();
    router.push(`/doc-editor?id=${doc.id}`);
  };

  const deleteDocument = async (event: any, doc: any) => {
    event.stopPropagation();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-doc/${doc.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API Error!`);
      }

      setUserDocs((prevDocs: any) => prevDocs.filter((prevDoc: any) => prevDoc.id !== doc.id));
    } catch (err) {
      console.log(err);
    }
  };

  const columns: GridColDef<(any)[number]>[] = [
    {
      field: 'name',
      headerName: 'Document Title',
      editable: true,
      flex: 2
    },
    {
      field: 'createdAt',
      headerName: 'Created On',
      type: 'date',
      valueGetter: (value) => (value ? new Date(value) : null),
      valueFormatter: (value?: Date) => {
        if (!value) return '';
        return value.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      editable: true,
      width: 190
    },
    {
      field: 'updatedAt',
      headerName: 'Updated On',
      type: 'date',
      valueGetter: (value) => (value ? new Date(value) : null),
      valueFormatter: (value?: Date) => {
        if (!value) return '';
        return value.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      editable: true,
      width: 190
    },
    {
      field: 'openDoc',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <IconButton color='primary' onClick={(event) => openDocument(event, params.row)}>
            <FileOpenOutlinedIcon fontSize="inherit" />
          </IconButton>
        );
      },
      renderHeader: () => null,
      width: 60
    },
    {
      field: 'deleteDoc',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <IconButton color='error' onClick={(event) => deleteDocument(event, params.row)}>
            <DeleteOutlinedIcon fontSize="inherit" />
          </IconButton>
        );
      },
      renderHeader: () => null,
      width: 60
    }
  ];

  type UploadState = {
    file: File;
    progress: number;
    failed: boolean;
  };

  const [upload, setUpload] = useState<UploadState | null>(null);

  const uploadWordFile = (file: File) => {
    setUpload({
      file,
      progress: 0,
      failed: false,
    });

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/import-doc`);
    xhr.setRequestHeader("Authorization", `Bearer ${userToken}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.floor(
          (event.loaded / event.total) * 100
        );

        // 100% when the server confirms success.
        setUpload((prev) =>
          prev ? { ...prev, progress: Math.min(progress, 99) } : prev
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUpload((prev) =>
          prev ? { ...prev, progress: 100 } : prev
        );

        const response = JSON.parse(xhr.responseText);

        const content = quill.clipboard.convert({
          html: response.html
        });

        saveImportedDocument(response.fileName, content);
      } else {
        setUpload((prev) =>
          prev ? { ...prev, failed: true } : prev
        );
      }
    };

    xhr.onerror = () => {
      setUpload((prev) =>
        prev ? { ...prev, failed: true } : prev
      );
    };

    xhr.send(formData);
  };

  useEffect(() => {
    const fetchUserDocs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-docs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`API Error!`);
        }

        const data = await response.json();
        setUserDocs(data.documents);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserDocs();
  }, []);
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:py-10">

        {/* Page heading */}
        <div className="mb-8">
          <Typography variant="h4" fontWeight={700}>
            My Documents
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create, import, and manage your documents in one place.
          </Typography>
        </div>

        {/* Document actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">

          {/* Create document */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
              },
            }}
          >
            <CardActionArea
              onClick={createNewDocument}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <CreateOutlinedIcon
                  color="primary"
                  sx={{ fontSize: 32, mb: 2 }}
                />

                <Typography variant="h6" fontWeight={600}>
                  Create a document
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Start with a blank document and write something new.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Import Word document */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Import a Word document
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Upload a .docx file and continue editing it.
            </Typography>

            <FileUpload.Root>
              <FileUpload.DropZone
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                allowsMultiple={false}
                maxSize={10 * 1024 * 1024}
                hint="Word documents only (.docx, max. 10 MB)"
                onDropFiles={(files) => uploadWordFile(files[0])}
                onDropUnacceptedFiles={() => {
                  console.error("Only Word documents are accepted");
                }}
              />

              {upload && (
                <FileUpload.List>
                  <FileUpload.ListItemProgressBar
                    name={upload.file.name}
                    size={upload.file.size}
                    progress={upload.progress}
                    failed={upload.failed}
                    type="word"
                    onRetry={() => uploadWordFile(upload.file)}
                    onDelete={() => setUpload(null)}
                  />
                </FileUpload.List>
              )}
            </FileUpload.Root>
          </Card>
        </div>

        {/* Documents table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="h5" fontWeight={700}>
                Your Documents
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {userDocs.length} {userDocs.length === 1 ? 'document' : 'documents'}
              </Typography>
            </div>
          </div>

          <Box
            sx={{
              height: 460,
              width: '100%',
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <DataGrid
              rows={userDocs}
              columns={columns}
              apiRef={apiRef}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              sx={{
                border: 0,

                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f9fafb',
                },

                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: '0.875rem',
                },

                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                },

                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f9fafb',
                },

                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #e5e7eb',
                },
              }}
            />
          </Box>
        </section>

      </main>
    </div>
  );
};