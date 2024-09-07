const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const multer = require('multer')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

dotenv.config()

const app = express()
const PORT = 3000

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ['https://caiross-backend.onrender.com'],
    methods: ['GET', 'POST']
}))
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'https://caiross-backend.onrender.com']
        }
    }
}))


const jsonDirectory = path.join(__dirname, 'json')
if (!fs.existsSync(jsonDirectory)) {
    fs.mkdirSync(jsonDirectory)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, jsonDirectory)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), (req, res, next) => {
    const { password } = req.body;
    console.log(req.body)
    console.log("Password from body:", password); // This should now log the password correctly

    // Check password after file upload
    if (password === process.env.PASSWORD) {
        try {
            return res.status(200).json({ message: 'JSON received successfully'});
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return res.status(400).json({ message: 'Invalid JSON format' });
        }
    } else {
        // Cleanup: delete uploaded file if the password is incorrect
        fs.unlinkSync(path.join(jsonDirectory, req.file.filename));
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

app.get('/jsons', (req, res) => {
    console.log('Fetching all JSON files');
    
    fs.readdir(jsonDirectory, (err, files) => {
        if (err) {
            console.error('Failed to read directory:', err);
            return res.status(500).json({ message: 'Failed to read JSON directory' });
        }

        // Filter for .json files and read each file’s content
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const jsonArrayPromises = jsonFiles.map(file => {
            return new Promise((resolve, reject) => {
                fs.readFile(path.join(jsonDirectory, file), 'utf-8', (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    try {
                        resolve(JSON.parse(data)); // Parse each JSON file
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });

        // Resolve all promises to get the array of JSON objects
        Promise.all(jsonArrayPromises)
            .then(jsonData => {
                return res.status(200).json(jsonData); // Send the array of JSON objects
            })
            .catch(error => {
                console.error('Error reading JSON files:', error);
                return res.status(500).json({ message: 'Error reading JSON files' });
            });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/config.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})