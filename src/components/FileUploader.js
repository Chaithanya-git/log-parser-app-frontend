import React, { useState, useRef } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Box, Container, Typography, styled } from "@mui/material";

const Input = styled("input")({
  display: "none",
});

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Update the file name in the state
    }
    setFile(file);
  };
  const handleUpload = async () => {
    if (!file) {
      setSnackbarMessage("Please select a file first!");
      setOpenErrorSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("logFile", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/parse-logs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      // Automatically download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "parsedLogs.json");
      document.body.appendChild(link);
      link.click();

      setSnackbarMessage("File uploaded successfully.");
      setOpenSuccessSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Error while uploading file.");
      setOpenErrorSnackbar(true);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccessSnackbar(false);
    setOpenErrorSnackbar(false);
  };

  const fileInputRef = useRef(null);

  //   const handleButtonClick = () => {
  //     fileInputRef.current.click();
  //   };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom>
          Log Parser App
        </Typography>
        <Input
          accept="*/*"
          id="contained-button-file"
          multiple
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <label htmlFor="contained-button-file">
          <Button variant="contained" component="span" disabled={loading}>
            Choose File
          </Button>
        </label>
        <Typography variant="subtitle1" gutterBottom>
          {fileName || "No file chosen"}
        </Typography>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Box>
        <Snackbar
          open={openSuccessSnackbar}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          open={openErrorSnackbar}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity="error">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default FileUploader;
