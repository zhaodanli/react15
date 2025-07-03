import React from 'react';
import styles from './Home.css';
import useStyles from 'isomorphic-style-loader-react18/useStyles';
import { Helmet } from 'react-helmet';

function Home() {

  useStyles(styles)

  console.log('styles', styles.color)

  return (
    <>
      <Helmet>
        <title className={styles.color}>首页标题</title>
        <meta name="description" content="首页描述"></meta>
      </Helmet>
      <div>
        Home
      </div>
    </>
  )
}
export default Home;