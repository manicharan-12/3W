import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import axios from "axios";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: semibold;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0051a2;
  }
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem;
  background-color: #f7f7f7;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ImageWrapper = styled.div`
  cursor: pointer;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  aspect-ratio: 1;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export default function SocialMediaTask() {
  const [submissions, setSubmissions] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/submissions");
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("socialMediaHandle", data.socialMediaHandle);
      Array.from(data.images).forEach((file) => {
        formData.append("images", file);
      });

      await axios.post("http://localhost:5000/api/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      reset();
      fetchSubmissions();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const openImageInNewTab = (imagePath) => {
    window.open(imagePath, "_blank", "noopener,noreferrer");
  };

  return (
    <Container>
      <Title>Social Media Task</Title>

      <SubTitle>User Submission Form</SubTitle>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register("name", { required: true })} placeholder="Name" />
        <Input
          {...register("socialMediaHandle", { required: true })}
          placeholder="Social Media Handle"
        />
        <Input
          type="file"
          {...register("images", { required: true })}
          multiple
          accept="image/*"
        />
        <Button type="submit">Submit</Button>
      </Form>

      <SubTitle>Admin Dashboard</SubTitle>
      <Dashboard>
        {submissions.map((submission) => (
          <Card key={submission._id}>
            <CardHeader>
              <CardTitle>{submission.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{submission.socialMediaHandle}</p>
              <ImageGrid>
                {submission.images.map((image, index) => {
                  const imagePath = `http://localhost:5000/api/uploads/${image}`;
                  return (
                    <ImageWrapper
                      key={index}
                      onClick={() => openImageInNewTab(imagePath)}
                    >
                      <Image
                        src={imagePath}
                        alt={`Uploaded by ${submission.name}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </ImageWrapper>
                  );
                })}
              </ImageGrid>
            </CardContent>
          </Card>
        ))}
      </Dashboard>
    </Container>
  );
}
