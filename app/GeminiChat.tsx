import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = "AIzaSyA0mo6OKtmhGmbWjoHKksDyyrMK4bmvWGw";

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "hello! ";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      showMessage({
        message: "Welcome to Mobia Chat 🤖",
        description:removeAsterisks(text),
        type: "info",
        icon: "info",
        duration: 2000,
      });
      setMessages([
        {
          text:removeAsterisks(text),
          user: false,
        },
      ]);
    };
    //function call
    startChat();
  }, []);

const removeAsterisks=(text)=>{
  return text.replace(/\*/g,"");
}

  const sendMessage = async () => {
    setLoading(true);
    const userMessage = { text: userInput, user: true };
    setMessages([...messages, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    setMessages([...messages, { text:removeAsterisks(text), user: false }]);
    setLoading(false);
    setUserInput("");

    // if (text) {
    //   Speech.speak(text);
    // }
    if (text && !isSpeaking) {
      Speech.speak(removeAsterisks(text));
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const toggleSpeech = () => {
    console.log("isSpeaking", isSpeaking);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(removeAsterisks(messages[messages.length - 1].text));
      setIsSpeaking(true);
    }
  };

  const ClearMessage = () => {
    setMessages("");
    setIsSpeaking(false);
  };
  
  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={[styles.messageText, item.user && styles.userMessage]}>
        {removeAsterisks(item.text)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.text}
        inverted
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.micIcon} onPress={toggleSpeech}>
          {isSpeaking ? (
            <FontAwesome
              name="microphone-slash"
              size={24}
              color="white"
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ) : (
            <FontAwesome
              name="microphone"
              size={24}
              color="white"
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Escreva uma pergunta"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="#fff"
        />
        {
          //show stop icon only when speaking
          showStopIcon && (
            <TouchableOpacity style={styles.stopIcon} onPress={ClearMessage}>
              <Entypo name="controller-stop" size={24} color="white" />
            </TouchableOpacity>
          )
        }
        {loading && <ActivityIndicator size="large" color="black" />}
      </View>
      <StatusBar style="dark"/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131314", marginTop: 8 },
  messageContainer: { padding: 10, marginVertical: 5,alignItems:"center" },
  messageText: { fontSize: 16,color:"white" },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1E1F20",
    borderRadius: 10,
    height: 50,
    color: "white",
  },
  micIcon: {
    padding: 10,
    backgroundColor: "#1E1F20",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight:5,
  },
  stopIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
});

export default GeminiChat;