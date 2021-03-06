//kak sohranyat fotki v firestore firebase
import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";
import firebase from "firebase";
require("firebase/firestore");
require("firebase/firebase-storage");

export default function Save(props) {
  console.log(props.route.params.image);
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    let imageRef = firebase
      .storage()
      .ref(
        "profilepicture/" +
          firebase.auth().currentUser.uid +
          "/" +
          "profilePicture"
      );
    imageRef
      .delete()
      .then(() => {
        console.log(`profilePicture has been deleted successfully.`);
      })
      .catch((e) => console.log("error on image deletion => ", e));

    const uri = props.route.params.image;
    const childPath = `profilepicture/${
      firebase.auth().currentUser.uid
    }/profilePicture`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const task = firebase.storage().ref().child(childPath).put(blob);

    const taskProgress = (snapshot) => {
      console.log(`transferred : ${snapshot.bytesTransferred}`);
    };
    const taskCompleted = () => {
      task.snapshot.ref.getDownloadURL().then((snapshot) => {
        console.log(snapshot);
        savePostData(snapshot);
      });
    };

    const taskError = (snapshot) => {
      console.log(snapshot);
    };

    task.on("state_changed", taskProgress, taskError, taskCompleted);
  };

  const savePostData = (downloadURL) => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        url: downloadURL,
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption ..."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
