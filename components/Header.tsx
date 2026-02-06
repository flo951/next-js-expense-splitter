import Link from 'next/link';
import { css, Interpolation, Theme } from '@emotion/react';
import { User } from '../util/database';
import { AnchorHTMLAttributes } from 'react';

const headerStyles = css`
  padding: 12px 12px;
  margin: 12px;
  border-radius: 8px;
  /* background-image: linear-gradient(
    to right top,
    #006e5f,
    #007372,
    #007884,
    #007c95,
    #007fa4
  ); */
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);

  border: 2px solid black;
  color: white;

  h3 {
    margin: 4px;
    padding: 8px;
    font-size: 20px;
    max-height: 42px;
    border: 2px solid #dc8409;
    border-radius: 8px;
  }

  a {
    color: white;
    text-decoration: none;
    margin: 4px;
    font-size: 20px;
    padding: 8px;
    max-height: 42px;
    max-width: max-content;
    display: inline-block;
    position: relative;

    :after {
      content: '';
      position: absolute;
      width: 100%;
      transform: scaleX(0);
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #dc8409;
      transform-origin: bottom right;
      transition: transform 0.3s ease-out;
    }

    :hover:after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
  @media only screen and (max-width: 800px) {
    width: 324px;
    margin: 12px auto;
  }
`;

const flexContainerStyles = css`
  display: flex;
  flex-direction: column;
  h3 {
    font-weight: 400;
  }
`;
const flexRowHeaderStyles = css`
  display: flex;
  justify-content: space-between;
`;

type HeaderProps = {
  userObject?: User;
};

const Anchor = ({
  children,
  ...restProps
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  css?: Interpolation<Theme>;
}) => {
  return <a {...restProps}>{children}</a>;
};

const Header = ({ userObject }: HeaderProps) => {
  return (
    <header css={headerStyles}>
      {userObject ? (
        <div css={flexRowHeaderStyles}>
          <div css={flexContainerStyles}>
            <Link href="/overview">Overview</Link>
            <Link href="/createevent">Create New Event</Link>
          </div>
          <div css={flexContainerStyles}>
            <h3>
              Hi
              <span data-test-id="logged-in-user">
                {userObject.username}
              </span>
            </h3>
            <Anchor data-test-id="logout" href="/logout">
              Logout
            </Anchor>
          </div>
        </div>
      ) : (
        <div css={flexRowHeaderStyles}>
          <Link href="/">Splitify</Link>
          <Link data-test-id="sign-up" href="/register">
            Register
          </Link>
          <Link data-test-id="login" href="/login">
            Login
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
