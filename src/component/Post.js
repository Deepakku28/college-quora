import { Avatar } from '@material-ui/core';
import { ArrowDownwardOutlined, ArrowUpwardOutlined, ChatBubbleOutlineOutlined, MoreHorizOutlined, RepeatOutlined, ShareOutlined } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import '../css/Post.css';
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import RepeatOutlinedIcon from "@material-ui/icons/RepeatOutlined";
import ChatBubbleOutlineOutlinedIcon from "@material-ui/icons/ChatBubbleOutlineOutlined";
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { selectQuestionId, selectQuestionName, setQuestionInfo } from '../features/questionSlice';
import db from '../firebase';
import { selectUser } from '../features/userSlice';
import firebase from 'firebase';

function Post({Id,question,image,timestamp,quoraUser}) {
    const user=useSelector(selectUser);
    const [openModal, setOpenModal]=useState(false);
    const dispatch=useDispatch();
    const questionId=useSelector(selectQuestionId);
    const questionName=useSelector(selectQuestionName);
    const [answer,setAnswer]=useState("");
    const [getAnswer,setGetAnswer]=useState([]);

    useEffect(()=>{
        if(questionId){
            db.collection('questions')
                .doc(questionId)
                .collection('answer')
                .orderBy('timestamp','desc')
                .onSnapshot(snapshot=>setGetAnswer(snapshot.docs.map((doc)=>({
                id: doc.id,
                answers:doc.data(),
            }))));
        }
    },[questionId]);

    const handleAnswer=(e)=>{
        e.preventDefault();

        if(questionId){
            db.collection('questions').doc(questionId).collection('answer').add({
                questionId: questionId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                answer: answer,
                user: user,
            });
        }
        console.log(questionId,questionName);
        setAnswer("");
        setOpenModal(false);
    };

    return (
        <div className="post"
            onClick={()=>dispatch(setQuestionInfo({
                questionId:Id,
                questionName:question,
            }))}
        >
            <div className="post-info">
                <Avatar 
                    src={user.photo}
                />
                <h5>
                    {user.displayName?user.displayName:user.email}
                </h5>
                <small>{new Date(timestamp?.toDate()).toLocaleString()}</small>
            </div>
            <div className="post-body">
                <div className="post-question">
                    <p>{question}</p>
                    <button onClick={()=>setOpenModal(true)} className="post-btn-answer">
                        Answer
                    </button>
                    <Modal
                        isOpen={openModal}
                        onRequestClose={()=>setOpenModal(false)}
                        shouldCloseOnOverlayClick={false}
                        style={{
                            overlay: {
                                width:680,
                                height:550,
                                backgroundColor:"rgba(0,0,0,0.8)",
                                zIndex:"1000",
                                top:"50%",
                                left:"50%",
                                marginTop:"-250px",
                                marginLeft:"-350px",
                            },
                        }}
                    >
                        <div className="modal-question">
                            <h1>{question}</h1>
                            <p>
                                asked by{" "}<span className="name">{quoraUser.displayName?quoraUser.displayName:quoraUser.email}</span>{" "}
                                on <span className="name">{new Date(timestamp?.toDate()).toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="modal-answer">
                            <textarea 
                                value={answer} 
                                required
                                onChange={(e)=>setAnswer(e.target.value)}
                                placeholder="Enter Your Answer" type="text"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="cancle" onClick={()=>setOpenModal(false)}>Cancel</button>
                            <button onClick={handleAnswer} type="submit" className="add">Add Answer</button>
                        </div>
                    </Modal>
                </div>
                <div className="post-answer">
                    {
                        getAnswer.map(({id,answers})=>(
                            <p key={id} style={{position: "relative",paddingBottom: "5px"}}>
                                {
                                    Id===answers.questionId?(<span>
                                            {answers.answer}
                                        <br/>
                                        <span
                                            style={{
                                                position: "absolute",
                                                color: "gray",
                                                fontSize: "small",
                                                display: "flex",
                                                right: "0px",
                                            }}
                                            >
                                            <span style={{color: "#b92b27"}}>
                                                {
                                                    answers.user.displayName
                                                    ?answers.user.displayName
                                                    :answers.user.email}{" "}
                                                    on {" "} 
                                                    {new Date(answers.timestamp?.toDate()).toLocaleString()}
                                            </span>
                                        </span>
                                    </span>
                                ) : (
                                    ""
                                )}
                            </p>
                        ))
                    }
                </div>
                <img src={image} alt=""></img>
            </div>
            <div className="post-footer">
                <div className="post-footer-action">
                    <ArrowUpwardOutlinedIcon />
                    <ArrowDownwardOutlinedIcon />
                </div>
                <RepeatOutlinedIcon />
                <ChatBubbleOutlineOutlinedIcon />
                <div className="post-footer-left">
                    <ShareOutlined />
                    <MoreHorizOutlined />
                </div>
            </div>
        </div>
    );
};

export default Post;