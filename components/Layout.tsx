import Head from 'next/head';
import { User } from '../util/database';
import Header from './Header';
type LayoutProps = {
  children: object;
  userObject?: User;
};
const Layout = ({ children, userObject }: LayoutProps) => {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-apple-touch.png" />
        <link rel="icon" href="images/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="images/icon-192.png" type="image/svg+xml" />
      </Head>
      <Header userObject={userObject} />

      <main>{children}</main>
    </>
  );
};

export default Layout;
