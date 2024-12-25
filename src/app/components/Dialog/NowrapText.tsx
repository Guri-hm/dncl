import Box from '@mui/material/Box';

type Props = {
  text: string
}

export function NowrapText({ text, ...props }: Props) {

  return (
    <Box sx={{
      display: 'grid',
      height: '40px',
      alignItems: 'center',
      marginRight: '10px',
      marginLeft: '10px',
      whiteSpace: 'nowrap'
    }}>
      {text}
    </Box>
  );
}
