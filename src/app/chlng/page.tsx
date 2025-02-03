

"use client"
import { PageWrapper } from "@/app/components/PageWrapper";
import { Header } from "@/app/components/Header";
import { HeaderItem } from "@/app/components/HeaderItem";
import { ContentWrapper } from "@/app/components/ContentWrapper";
import Grid from '@mui/material/Grid2';
import HeaderTitle from "../components/HeaderTitle";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, SvgIcon, Typography } from "@mui/material";
import { styled } from '@mui/system';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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

function CrownIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M5 16h14v2H5zm0-4 2-2 2.5 3 2.5-3 2.5 3L17 10l2 2v4H5zm0-2 3-3 2 2.5L12 8l1.5 2L15 8l3 3V5H5z" />
    </SvgIcon>
  );
}


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
              <ListItem>
                <ListItemButton component="a" href={`/chlng/${"1"}`}>
                  <ListItemAvatar>
                    <Avatar>
                      <AutoAwesomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="代入文" secondary="未クリア" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component="a" href={`/chlng/${"2"}`}>
                  <ListItemAvatar>
                    <Avatar>
                      <AutoAwesomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="条件式" secondary="未クリア" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AutoAwesomeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Vacation" secondary="July 20, 2014" />
              </ListItem>
            </List>
          </Grid>
          <Grid spacing={3} size='auto'>
            <CustomTypography variant="h4">
              <span>問題</span>
            </CustomTypography>
          </Grid>
          <Grid size={3} sx={{ textAlign: 'center' }}>
            <img src={"/stand_by_the_desk.svg"} alt={'机と女の子'} style={{ width: "100%", maxWidth: "300px" }} />
          </Grid>
        </Grid>
      </ContentWrapper>
    </PageWrapper >
  );
}


