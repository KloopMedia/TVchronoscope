import React, { useEffect, useState } from "react";
import firebase from "./Firebase";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setCurrentUser(user)
      setPending(false)
      let rootRef = firebase.firestore().collection("users")
      let systemRef = firebase.firestore().collection("tagSystems")
      if (user) {
        let userRef = rootRef.doc(user.uid)
        userRef.get().then(doc => {
          if (doc && doc.exists) {
              // pass
          }
          else {
            console.log("Creating user")
            systemRef.add({
              systemName: "default",
              createdBy: user.email
            }).then((doc) => {
              userRef.set(
                {
                  name: user.displayName,
                  email: user.email,
                  tagSystems: firebase.firestore.FieldValue.arrayUnion({id: doc.id, name: "default"})
                }
              )
              systemRef.doc(doc.id).collection("systemAdmins").doc(user.uid).set({})
            })
          }
        })
      }
    });
  }, []);

  // if(pending){
  //   return <>Loading...</>
  // }

  return (
    <AuthContext.Provider
      value={{
        currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
