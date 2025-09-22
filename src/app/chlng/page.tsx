

"use client"
import { PageWrapper } from "@/app/components/PageWrapper";
import { HeaderBar } from "@/app/components/Header/HeaderBar";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import Grid from '@mui/material/Grid2';
import { HeaderTitle } from "../components/Header";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { styled } from '@mui/system';
import { CheckedIcon, basicChallenges, UnachievedIcon, advancedChallenges } from "@/app/components/Challenge";
import { useAchievements, storageKey } from "@/app/hooks";
import { useRef, useState } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ThemeToggleButton } from '@/app/components/Header';

const CustomTypography = styled(Typography)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  textAlign: 'center',
  position: 'relative',

  '&::before, &::after': {
    content: '""',
    display: 'block',
    flex: '1 1 auto',
    minWidth: 8,
    height: 2,
    alignSelf: 'center',
    // ダークモードは白寄り、ライトモードは黒寄りで濃さを調整
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
    margin: '0 8px', // 文字に近づける（左右の余白を短く）
  },

  '& span': {
    padding: '0 0.5em',
    background: 'transparent', // 背景不要
    zIndex: 2,
  },
}));

//<ListItemButton> コンポーネントの href がルート (/) に基づいているため、ベースパスが含まれていないリンクが生成される
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
      <HeaderBar
        leftContent={<HeaderTitle />}
        rightContent={
          <>
            <Button ref={buttonRef}
              sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
              onClick={handleClickOpen}
              endIcon={<RestartAltIcon />}
              variant="contained"
            >
              リセット
            </Button>
            <ThemeToggleButton sx={{ marginLeft: "auto" }} />
          </>
        }
      />
      <ContentWrapper>
        <Grid container direction={"column"} sx={{
          justifyContent: "flex-start",
          alignItems: "center",
          height: '100%',
        }} >
          <Grid spacing={3} size='auto' sx={{ margin: 2 }}>
            <CustomTypography variant="h2">
              <span>基本</span>
            </CustomTypography>
            <List sx={{ width: '100%', maxWidth: 360 }}>
              {basicChallenges.map((challenge, index) => (
                <ListItem key={index}>
                  <ListItemButton component="a" href={`${basePath}/chlng/${challenge.id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        {achievements[challenge.id] && achievements[challenge.id].isAchieved
                          ?
                          <CheckedIcon sx={(theme) => ({ color: theme.palette.mode === 'dark' ? '#49cc39' : '#228B22' })} />
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
              <span>応用</span>
            </CustomTypography>
            <List sx={{ width: '100%', maxWidth: 360 }}>
              {advancedChallenges.map((challenge, index) => (
                <ListItem key={index}>
                  <ListItemButton component="a" href={`${basePath}/chlng/${challenge.id}`}>
                    <ListItemAvatar>
                      <Avatar>
                        {achievements[challenge.id] && achievements[challenge.id].isAchieved
                          ?
                          <CheckedIcon sx={(theme) => ({ color: theme.palette.mode === 'dark' ? '#49cc39' : '#228B22' })} />
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


