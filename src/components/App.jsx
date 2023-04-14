import { useState, useEffect } from 'react';

import {
  NotificationContainer,
  NotificationManager,
} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import { fetchImg } from 'components/Api/Api';
import SearchBar from 'components/SearchBar';
import ImageGallery from 'components/ImageGallery';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Loader from 'components/Loader';
import Div from './App.styled';

function App() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState(null);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!query) return;
    fetchImages(query, page);
  }, [query, page]);

  const fetchImages = (query, page) => {
    const perPage = 12;
    setIsLoading(true);

    fetchImg(query, page, perPage)
      .then(({ hits, totalHits }) => {
        const totalPages = Math.ceil(totalHits / perPage);

        const data = hits.map(({ id, webformatURL, largeImageURL, tags }) => {
          return {
            id,
            webformatURL,
            largeImageURL,
            tags,
          };
        });
        setImages(images => [...images, ...data]);
        setTotal(totalHits);

        if (hits.length === 0) {
          return NotificationManager.error(
            'Sorry, no images found. Please, try again!'
          );
        }

        if (page === 1) {
          NotificationManager.success(`Hooray! We found ${totalHits} images.`);
        }

        if (page === totalPages) {
          NotificationManager.info("You've reached the end of search results.");
        }
      })
      .catch(error => setError(error))
      .finally(() => setIsLoading(false));
  };

  const handleSearch = query => {
    setQuery(query);
    setPage(1);
    setImages([]);
    setError(null);
  };

  const onLoadMore = () => {
    setPage(page => page + 1);
  };

  const toggleModal = (largeImageURL, tags) => {
    setShowModal(!showModal);
    setLargeImageURL(largeImageURL);
    setTags(tags);
  };

  const loadImages = images.length !== 0;
  const lastPage = images.length === total;
  const loadMoreBtn = loadImages && !isLoading && !lastPage;

  return (
    <Div>
      <SearchBar onSubmit={handleSearch} />

      {error && NotificationManager.error(error.message)}

      {isLoading && <Loader />}

      {loadImages && <ImageGallery images={images} onClick={toggleModal} />}

      {loadMoreBtn && <Button onClick={onLoadMore}>Load more</Button>}

      {showModal && (
        <Modal onClose={toggleModal}>
          <img src={largeImageURL} alt={tags} />
        </Modal>
      )}

      <NotificationContainer />
    </Div>
  );
}

export default App;
