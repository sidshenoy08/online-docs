'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import Box from '@mui/material/Box';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useEffect, useState } from 'react';

import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import Navbar from "@/components/Navbar";
import { useAuthStore } from '@/app/store/authStore';


export default function UserHome() {
  const [userDocs, setUserDocs] = useState([]);
  const apiRef = useGridApiRef();

  const openDocument = async (event: any, doc: any) => {
    event.stopPropagation();
  };

  const deleteDocument = async (event: any, doc: any) => {
    event.stopPropagation();
    
    const userToken = useAuthStore.getState().accessToken;

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
      editable: true
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
      editable: true
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
      editable: true
    },
    {
      field: 'openDoc',
      sortable: false,
      filterable: false,
      renderCell: (row) => {
        return (
          <IconButton color='primary' onClick={(event) => openDocument(event, row)}>
            <FileOpenOutlinedIcon fontSize="inherit" />
          </IconButton>
        );
      },
      renderHeader: () => null
    },
    {
      field: 'deleteDoc',
      sortable: false,
      filterable: false,
      renderCell: (row) => {
        return (
          <IconButton color='error' onClick={(event) => deleteDocument(event, row)}>
            <DeleteOutlinedIcon fontSize="inherit" />
          </IconButton>
        );
      },
      renderHeader: () => null
    }
  ];

  useEffect(() => {
    const fetchUserDocs = async () => {
      const userToken = useAuthStore.getState().accessToken;

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

  useEffect(() => {
    if (userDocs.length > 0 && apiRef.current) {
      apiRef.current.autosizeColumns({
        includeHeaders: true,
        includeOutliers: true,
      });
    }
  }, [userDocs, apiRef]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-row items-start gap-4 justify-center pt-10">
        {/* <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            '& > :not(style)': {
              m: 1,
              width: 180,
              height: 150
            }
          }}
        >
          <Paper elevation={3} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, p: 2}}>
            <CreateOutlinedIcon color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{whiteSpace: 'nowrap'}}>
              Create a new document
            </Typography>
          </Paper>
        </Box> */}
        <Card>
          <CardContent sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <CreateOutlinedIcon color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Create a new document
            </Typography>
          </CardContent>
        </Card>

        <FileUpload.Root>
          <FileUpload.DropZone />
          <FileUpload.List>
            <FileUpload.ListItemProgressBar />
          </FileUpload.List>
        </FileUpload.Root>
      </div>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={userDocs}
          columns={columns}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.875rem',
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          apiRef={apiRef}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  )
};