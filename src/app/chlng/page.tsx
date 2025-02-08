

"use client"
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import Grid from '@mui/material/Grid2';
import HeaderTitle from "../components/HeaderTitle";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { styled } from '@mui/system';
import CheckedIcon from "../components/CheckedIcon";
import UnachievedIcon from "../components/UnachievedIcon";
import { allChallengesItems } from "../components/Challenges";
import useAchievements, { Achievement, storageKey } from "../hooks/useAchievements";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useState } from "react";

// interface Achievement {
//   isAchieved: boolean;
//   achievedDate: string;
// }

// const achievements: { [key: string]: Achievement } =
// {
//   "1": { isAchieved: true, achievedDate: '2025/01/01' },
//   // 他の達成状況を追加
// }

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

  const { achievements, clearAchievements } = useAchievements(storageKey);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleClear = () => {
    clearAchievements();
    setOpen(false);
  };

  console.log(achievements)
  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
          <Button
            sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
            onClick={handleClickOpen}
            endIcon={<ClearAllIcon />}
            variant="contained"
          >
            記録のリセット
          </Button>
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
              {allChallengesItems.map((challenge, index) => (
                <ListItem key={index}>
                  <ListItemButton component="a" href={`/chlng/${challenge.id}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'black' }}>
                        {achievements[challenge.id] && achievements[challenge.id].isAchieved
                          ?
                          <CheckedIcon sx={{ color: 'rgb(73, 204, 57)' }} />
                          :
                          <UnachievedIcon />
                        }
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={challenge.title} secondary={achievements[challenge.id] ? achievements[challenge.id].achievedDate : ''} />
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

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            記録をリセットしますか？
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              リセットすると元に戻せません
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>キャンセル</Button>
            <Button onClick={handleClear} color="error" variant="outlined" >
              削除
            </Button>
          </DialogActions>
        </Dialog>
      </ContentWrapper>
    </PageWrapper >
  );
}


