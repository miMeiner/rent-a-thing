import { NextPage } from "next";
import Head from "next/head";
import { Footer } from "../src/components/big/footer/Footer";
import { Header } from "../src/components/big/header/Header";
import { BannerText } from "../src/components/small/bannerText/BannerText";
import { FilterAndText } from "../src/components/small/filterAndText/FilterAndText";
import { PrimaryButton } from "../src/components/small/primarybtn/PrimaryBtn";
import { ProductCard } from "../src/components/small/productcard/ProductCard";
import { PostProps, useFetch, usePost } from "../src/utils/Hooks";
import styles from "./index.module.scss";

const Home: NextPage = () => {
  const { response } = useFetch("posts");

  const dummyData = {
    title: "hammare",
    desc: "very nice hammer",
    picture: "",
    price: "3000",
  };

  const test = () => {
    usePost("posts", dummyData);
  };

  return (
    <div>
      <Head>
        <title>Rent-a-thing</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <BannerText />
      <FilterAndText />
      <div className={styles.productContainer}>
        <div className={styles.productGrid}>
          {response?.slice(0, 10).map((posts: PostProps, key) => {
            return (
              <ProductCard
                key={key}
                title={posts.title}
                price={posts.price}
                image={"https://picsum.photos/200"}
              />
            );
          })}
        </div>
      </div>
      <PrimaryButton onClick={test} submit={false} text="add" />
      <Footer />
    </div>
  );
};

export default Home;
