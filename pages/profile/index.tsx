import { Modal, ModalContent, ModalOverlay, useToast } from '@chakra-ui/react';
import { getAuth, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../src/auth/AuthContext';
import { Header } from '../../src/components/big/header/Header';
import { ImageModal } from '../../src/components/big/imagemodal/ImageModal';
import { Slider } from '../../src/components/big/sliderbtn/Slider';
import { AddButton } from '../../src/components/small/addbtn/AddBtn';
import { PrimaryButton } from '../../src/components/small/primarybtn/PrimaryBtn';
import { ProductCard } from '../../src/components/small/productcard/ProductCard';
import { RequestCard } from '../../src/components/small/requestcard/RequestCard';
import { TextField } from '../../src/components/small/textfield/TextField';
import { db } from '../../src/firebase/Firebase';
import {
  GetUser,
  ProductProps,
  RequestProps,
  useFetch,
} from '../../src/utils/Hooks';
import styles from './ProfilePage.module.scss';

const ProfilePage: NextPage = () => {
  const { user } = GetUser();
  const { response } = useFetch('posts', undefined, user.id);
  const toast = useToast();

  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [contentSwitch, setContentSwitch] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [descModal, setDescModal] = useState(user.description ? false : true);
  const [description, setDescription] = useState(user.description);
  console.log(user.description);

  const HandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updateUserDescription = doc(db, `users/${user.id}`);
    updateDoc(updateUserDescription, {
      description: description,
    });
    setDescription('');
    setCurrentUser({ ...currentUser, description });
  };

  // only for dev
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setCurrentUser({});
      })
      .catch((error) => {
        console.error(error.message);
      });
    Router.push('/');
  };

  const handleAcceptRequest = (request: RequestProps) => {
    console.log('p', request.productData.id);
    const testTimesRented = request.productData.timesRented + 1;

    const updatePostAvailable = doc(db, `posts/${request.productData.id}`);
    updateDoc(updatePostAvailable, {
      available: false,
      timesRented: testTimesRented,
    });
    deleteDoc(doc(db, `requests/${request.id}`));
    toast({
      title: 'Förfrågan godkänd.',
      duration: 2000,
      status: 'success',
    });
  };

  const handleDeclineRequest = (request: RequestProps) => {
    deleteDoc(doc(db, `requests/${request.id}`));
    toast({
      title: 'Förfrågan nekad.',
      duration: 2000,
      status: 'info',
    });
  };

  useEffect(() => {
    if (user.id === undefined) {
      return;
    }

    const q = query(
      collection(db, 'requests'),
      where('connectedOwnersId', '==', user.id)
    );

    getDocs(q).then((res) => {
      setRequests(
        res.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const requestFilter = (requests: RequestProps) =>
    requests.productData.available === true;

  const closeModal = () => {
    setVisible(false);
    setDescModal(false);
  };

  return (
    <>
      <Header />
      <ImageModal close={closeModal} visible={visible} />

      <div className={styles.wallpaper}>
        <h1 className={styles.title}>Profil</h1>
      </div>
      <div className={styles.profileInfo}>
        <div className={styles.imgContainer}>
          {user.photoURL ? (
            <Image
              className={styles.img}
              alt="profile-picture"
              src={user.photoURL}
              width={160}
              height={160}
              onClick={() => {
                setVisible((prevState) => !prevState);
              }}
            />
          ) : null}
        </div>
        <h1 className={styles.title}>
          {user.displayName ? user.displayName : user.email}
        </h1>
        {!user.description ? (
          <div>
            <Modal
              isOpen={descModal}
              onClose={closeModal}
              isCentered
              size="fit"
            >
              <ModalOverlay backdropFilter="blur(20px)" filter="grayscale(1)" />
              <ModalContent className={styles.descriptionModal} w="fit-content">
                <form
                  className={styles.form}
                  onSubmit={HandleSubmit}
                  id="descriptionForm"
                >
                  <h1>Ange en kort beskrivning av dig själv</h1>
                  <p>{'(Detta kommer att visas i din profil)'}</p>
                  <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beskrivning"
                    id="description"
                  />{' '}
                  <PrimaryButton
                    disabled={!description}
                    text="Uppdatera"
                    submit
                  />
                </form>
              </ModalContent>
            </Modal>
          </div>
        ) : (
          <div className={styles.descriptionContainer}>
            <pre className={styles.userDescription}>{user.description}</pre>
          </div>
        )}
      </div>
      <div className={styles.buttonContainer}>
        <PrimaryButton
          text="Logga ut"
          onClick={handleSignOut}
          id="logOutButton"
        />
      </div>
      <div className={styles.navContainer}>
        <Link href="/new">
          <a className={styles.link}>
            <h3 className={styles.text}>Ny annons</h3>
            <AddButton id="addProductButton" />
          </a>
        </Link>

        <div>
          <Slider
            onClick={() => setContentSwitch(!contentSwitch)}
            primary="Annonser"
            secondary="Förfrågningar"
            state={contentSwitch}
          />
        </div>
      </div>
      {contentSwitch ? (
        <div className={styles.productContainer}>
          <div className={styles.productGrid}>
            {requests
              .filter(requestFilter)
              .map((request: RequestProps, key) => (
                <RequestCard
                  item={request.productData.title}
                  renter={request.requestedBy.displayName}
                  image={request.productData.img}
                  key={request.id}
                  accept={() => handleAcceptRequest(request)}
                  decline={() => handleDeclineRequest(request)}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className={styles.productContainer}>
          <div className={styles.productGrid}>
            {response.map((post: ProductProps, key) => {
              return (
                <Link href={'/detail/' + post.id} key={key}>
                  <ProductCard
                    available={post.available}
                    title={post.title}
                    price={post.price}
                    image={post.img}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
