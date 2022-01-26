import axios from "axios";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Container, Form, Spinner, Stack } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import { orderBy, uniqBy } from "lodash";

const Home: React.FC = () => {
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState<string>();
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<any[]>();
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleOnChange = useCallback(
    (event, prop) => {
      if (prop === "title") {
        setTitle(event.target.value);
      }
      if (prop === "content") {
        setContent(event.target.value);
      }
    },
    [title, content]
  );
  const createdAt = moment().unix();
  const onSubmit = () => {
    axios
      .post("http://localhost:8080/create-feed", {
        title,
        content,
        createdAt,
      })
      .then((response) => {
        if (response && response.data && response.data.success) {
          setTitle("");
          setContent("");
          setTotalPosts(response.data.count);
          setPosts([...(posts || []), response.data.payload]);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log("Create New Post Failed!");
      });
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      await axios
        .get(`http://localhost:8080/?page=${page}&limit=2`)
        .then((response) => {
          if (response && response.data && response.data.success) {
            setPosts(response.data.payload);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log("Fetch Posts Failed");
        });
    };
    fetchFeeds();
  }, []);

  const fetchMoreData = () => {
    setPage(page + 1);
    const fetchFeeds = async () => {
      await axios
        .get(`http://localhost:8080/?page=${page}&limit=5`)
        .then((response) => {
          if (response && response.data && response.data.success) {
            setPosts(posts?.concat(response.data.payload));
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log("Page Increment Failed");
        });
    };
    fetchFeeds();
  };

  const sortedPosts = orderBy(posts, ["createdAt"], ["desc"]);
  const uniquePosts = uniqBy(sortedPosts, "_id");

  return (
    <div>
      <h1 className="m-5">Create New Post</h1>
      <Container>
        <Form className="mb-3">
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              type="text"
              placeholder="Enter Title"
              onChange={(e) => handleOnChange(e, "title")}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Content</Form.Label>
            <Form.Control
              onChange={(e) => handleOnChange(e, "content")}
              required
              value={content}
              as="textarea"
              rows={3}
            />
          </Form.Group>
          <Button onClick={onSubmit} variant="warning">
            Submit Content
          </Button>{" "}
        </Form>
        <hr />
        <hr />
        <hr />
      </Container>
      <Container className="mb-5">
        <h1>Posts</h1>
      </Container>
      <Container>
        <InfiniteScroll
          dataLength={uniquePosts?.length || 0}
          next={fetchMoreData}
          hasMore={uniquePosts?.length !== totalPosts}
          loader={isLoading && <Spinner animation="border" variant="danger" />}
        >
          <Stack gap={4} className="col-md-4 mx-auto mb-2">
            {!isLoading && uniquePosts ? (
              uniquePosts.map((post) => (
                <Card style={{ width: "28rem" }}>
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Spinner
                animation="border"
                className="col-md-4 mx-auto"
                variant="danger"
              />
            )}
          </Stack>
        </InfiniteScroll>
      </Container>
    </div>
  );
};

export default Home;
