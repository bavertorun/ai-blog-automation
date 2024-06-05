import axios from "axios";
import "dotenv/config"
import express from "express";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 8080;



const generateContent = async ()=>{
 const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: process.env.PROMPT_SYSTEM },
            { role: "user", content:process.env.PROMPT_USER }
        ],
          model: process.env.OPENAI_MODEL,
        });

        const openaiResponse =JSON.parse(completion.choices[0].message.content);
        
        return openaiResponse
}

const sendPost = async (data) => {

        const mediumData = {
            ...data,
            "contentFormat": "html",
            "publishStatus": "public"
        };

    try {
        const response = await axios({
            method: 'POST',
            url: `https://api.medium.com/v1/users/${process.env.MEDIUM_AUTHOR_ID}/posts`,
            headers: {
                'Authorization': `Bearer ${process.env.MEDIUM_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data: mediumData,
        });
        return response.data;
    } catch (error) {
        console.error('Error posting to Medium:', error);
        throw error;
    }
};


app.get('/', async (req,res)=>{

 try {

    const openaiResponse = await generateContent();
    const mediumResponse = await sendPost(openaiResponse);
    
    res.send(mediumResponse);
    
 } catch (error) {
    res.json(error);
 }

});


app.listen(PORT,()=>{

    console.log(`Listining on port ${PORT}`);

});