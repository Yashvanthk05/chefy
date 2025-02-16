import { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
    const [fileData, setFileData] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadImageBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileData(file); // Store the file data for use
            try {
                setLoading(true);
                const base64Image = await loadImageBase64(file);
                // Call the API with the base64-encoded image
                const response = await axios({
                    method: "POST",
                    url: "https://detect.roboflow.com/chefy/1",
                    params: {
                        api_key: "6QDWXughPtJg42hJHXaE"
                    },
                    data: {
                        image: base64Image
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                });
                setResponse(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h1>Upload Image for Prediction</h1>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {response && (
                <div>
                    <h2>Prediction Results:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
