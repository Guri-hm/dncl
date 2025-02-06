

"use client"
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import Grid from '@mui/material/Grid2';
import HeaderTitle from "../components/HeaderTitle";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { styled } from '@mui/system';
import CheckedIcon from "../components/CheckedIcon";
import UnachievedIcon from "../components/UnachievedIcon";

interface Task {
  taskId: number;
  taskTitle: string;
  isAchieved: boolean;
  achievedDate: Date | null;
}

const tasks: Task[] = [
  { taskId: 1, taskTitle: '代入文', isAchieved: true, achievedDate: new Date('2025-01-01') },
  { taskId: 2, taskTitle: '表示文', isAchieved: false, achievedDate: null },
  // 他の達成状況を追加
];

const CustomTypography = styled(Typography)(({ theme }) => ({
  position: 'relative',
  padding: '0 65px',
  textAlign: 'center',
  '&:before': {
    position: 'absolute',
    top: 'calc(50% - 1px)',
    left: 0,
    width: '100%',
    height: '2px',
    content: '""',
    background: '#000',
  },
  '& span': {
    position: 'relative',
    padding: '0 1em',
    background: 'var(--stone-50)',
  },
}));


export default function Home() {

  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
        </HeaderItem>
      </Header>
      <ContentWrapper>
        <Grid container direction={"column"} sx={{
          justifyContent: "center",
          alignItems: "center", height: '100%',
          backgroundColor: 'var(--stone-50)'
        }} >
          <Grid spacing={3} size='auto'>
            <CustomTypography variant="h4">
              <span>練習</span>
            </CustomTypography>
            <List sx={{ width: '100%', maxWidth: 360 }}>

              {tasks.map((task, index) =>
                <ListItem key={index}>
                  <ListItemButton component="a" href={`/chlng/${task.taskId}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'black' }}>
                        {task.isAchieved
                          ?
                          <CheckedIcon sx={{ color: 'rgb(73, 204, 57)' }} />
                          :
                          <UnachievedIcon />
                        }
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={task.taskTitle} secondary={task.achievedDate ? task.achievedDate.toString() : ''} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Grid>
          <Grid spacing={3} size='auto'>
            <CustomTypography variant="h4">
              <span>問題</span>
            </CustomTypography>
          </Grid>
        </Grid>
      </ContentWrapper>
    </PageWrapper >
  );
}


