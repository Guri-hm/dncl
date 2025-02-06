

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
import { allChallengesItems } from "../components/Challenges";
import { Challenge } from "../types";

interface Achievement {
  id: number;
  isAchieved: boolean;
  achievedDate: Date | null;
}

const achievements: Achievement[] = [
  { id: 1, isAchieved: true, achievedDate: new Date('2025-01-01') },
  { id: 2, isAchieved: false, achievedDate: null },
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

const allChallengesItemsArray: (Challenge | null)[] = Object.values(allChallengesItems);

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
              <span>基本</span>
            </CustomTypography>
            <List sx={{ width: '100%', maxWidth: 360 }}>
              {allChallengesItemsArray.map((challenge, index) => (
                <ListItem key={index}>
                  <ListItemButton component="a" href={`/chlng/${index}`}>
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

              ))}
            </List>
          </Grid>
          <Grid spacing={3} size='auto'>
            <CustomTypography variant="h4">
              <span>初級</span>
            </CustomTypography>
          </Grid>
        </Grid>
      </ContentWrapper>
    </PageWrapper >
  );
}


