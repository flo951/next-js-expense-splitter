import { css } from '@emotion/react';
import Head from 'next/head';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h1 {
    font-weight: 400;
  }
`;
const spanStyles = css`
  margin: 1rem;
  font-size: 24px;
  text-align: center;
`;
const imageStyles = css`
  margin: 1rem 0;
  border: 2px solid black;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

// type Props = {
//   refreshUserProfile: () => void;
//   userObject: { username: string };
// };
export default function Home() {
  // useEffect(() => {
  //   props.refreshUserProfile();
  // }, [props]);
  return (
    <>
      <Head>
        <title>Final Project</title>
        <meta name="description" content="Generated by create next app" />
      </Head>
      <main css={mainStyles}>
        <h1>Welcome to Splitify</h1>
        <span css={spanStyles}>Take a sneak peek how the app works</span>
        <img
          css={imageStyles}
          src="/images/example_result.png"
          alt="example calculation"
          height="367.75px"
          width="304.5px"
        />
        <span css={spanStyles}>
          <a href="./register">Create an Account</a> to use our Service
        </span>
      </main>
    </>
  );
}
