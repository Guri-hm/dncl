import Grid from '@mui/material/Grid2';

type Props = {
  children: React.ReactNode;
}

export function FixedHeightGrid({ children, ...props }: Props) {

  return (
    <Grid size="auto" sx={{
      display: 'grid',
      height: '40px',
      alignItems: 'center',
      marginLeft: '10px',
      marginRight: '10px'
    }}>
      {children}
    </Grid>
  );
}
