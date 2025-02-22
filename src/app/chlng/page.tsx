

"use client"
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header } from "@/app/components/Header/Header";
import { HeaderItem } from "@/app/components/Header/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import Grid from '@mui/material/Grid2';
import { HeaderTitle } from "../components/Header";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { styled } from '@mui/system';
import { CheckedIcon, allChallengesItems, UnachievedIcon } from "@/app/components/Challenge";
import { useAchievements, storageKey } from "@/app/hooks";
import { useRef, useState } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';


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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (buttonRef.current) {
      // ダイアログを閉じた後にフォーカスを戻す(area-hiddenのエラー回避)
      buttonRef.current.focus();
    }
  };
  const handleClear = () => {
    clearAchievements();
    setOpen(false);
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderItem>
          <HeaderTitle />
          <Button ref={buttonRef}
            sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
            onClick={handleClickOpen}
            endIcon={<RestartAltIcon />}
            variant="contained"
          >
            リセット
          </Button>
        </HeaderItem>
      </Header>
      <ContentWrapper>
        <Grid container direction={"column"} sx={{
          justifyContent: "flex-start",
          alignItems: "center",
          height: '100%',
          backgroundColor: 'var(--stone-50)'
        }} >
          <Grid spacing={3} size='auto' sx={{ margin: 2 }}>
            <CustomTypography variant="h2">
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
          <Grid spacing={3} size='auto' sx={{ margin: 2 }}>
            <CustomTypography variant="h2">
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


