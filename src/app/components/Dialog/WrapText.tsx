import Box from '@mui/material/Box';

type Props = {
  text: string
}

export function WrapText({ text, ...props }: Props) {

  return (
    <Box sx={{
      display: 'grid',
      alignItems: 'start',
      marginRight: '10px',
      marginLeft: '10px',
      paddingTop: '8px'
    }}>
      {text}
    </Box>
  );
}
