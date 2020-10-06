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
      let userRef = rootRef.doc(user.uid)
      userRef.get().then(doc => {
        if (doc && doc.exists) {
            // pass
        }
        else {
          userRef.set(
            {
              name: user.displayName,
              email: user.email
            }
          )
        }
      })
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
