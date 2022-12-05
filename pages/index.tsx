import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Footer } from '../src/components/big/footer/Footer';
import { Header } from '../src/components/big/header/Header';
import { FilterCategory } from '../src/components/filterCategory/FilterCategory';
import { AddButton } from '../src/components/small/addbtn/AddBtn';
import { BannerText } from '../src/components/small/bannerText/BannerText';
import { FilterAndText } from '../src/components/small/filterAndText/FilterAndText';
import { ProductCard } from '../src/components/small/productcard/ProductCard';
import { GetUser, PostProps, useFetch } from '../src/utils/Hooks';
import styles from './index.module.scss';

const Home: NextPage = () => {
  const { response } = useFetch('posts');
  const [isShown, setIsShown] = useState(false);
  const [category, setCategory] = useState<string | undefined>();

  const handleClick = () => {
    setIsShown((prevState) => !prevState);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value === 'All' ? undefined : e.target.value);
  };

  const categoryFilter = (post: PostProps) =>
    category === undefined || post.category === category;

  const { user } = GetUser();

  return (
    <div className={styles.container}>
      <Head>
        <title>Rent-a-thing</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href={'/Logo.svg'} />
      </Head>
      <Header />
      <BannerText />
      {user.id ? (
        <div className={styles.navigationLink}>
          <Link href="/new">
            <div>
              <AddButton large />
            </div>
          </Link>
        </div>
      ) : null}

      <FilterAndText onClick={handleClick} />
      {isShown ? <FilterCategory small onChange={handleFilterChange} /> : null}

      <div className={styles.productContainer}>
        <div className={styles.productGrid}>
          {response
            // ?.slice(0, 10)
            .filter(categoryFilter)
            .map((post: PostProps, key) => {
              return (
                <Link href={'/detail/' + post.id} key={key}>
                  <ProductCard
                    title={post.title}
                    price={post.price}
                    image={post.img}
                  />
                </Link>
              );
            })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
