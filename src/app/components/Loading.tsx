import styles from './loading.module.css'

interface Props {
    fadeOut?: boolean;
}

export default function Loading({ fadeOut = false }: Props) {
    return <div className={`${styles.Contents} ${fadeOut ? styles.FadeOut : ''}`} >
        <div className={styles.LoadingArea}>
            <p>loading........</p>
        </div>
    </div>
}