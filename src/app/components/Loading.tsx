import styles from './loading.module.css'

interface Props {
    fadeOut?: boolean;
}

export default function Loading({ fadeOut = false }: Props) {
    return (
        <div
            className={`${styles.Contents} ${fadeOut ? styles.FadeOut : ''}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--stone-50)',
                zIndex: 9999,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            <div className={styles.LoadingArea}>
                <p style={{
                    width: '200px',
                    borderRight: '5px solid #000',
                    color: '#353535',
                    fontSize: '30px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.3',
                    margin: 0
                }}>loading........</p>
            </div>
        </div>
    )
}