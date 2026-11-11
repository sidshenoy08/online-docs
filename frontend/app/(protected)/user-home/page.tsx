'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';

import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import Navbar from "@/components/Navbar";

import { useAuthStore } from '@/app/store/authStore';


export default function UserHome() {
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
    </div>
  )
};