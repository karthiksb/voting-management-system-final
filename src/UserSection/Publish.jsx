import React from "react";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";

export default function Publish(props) {
  const [result, setResult] = useState("");
  const [completedata, setCompletedData] = useState();
  const auth = getAuth();
  const history = useHistory();

  const [resultID, setResultID] = useState("");

  async function publish() {
    const docRef = doc(db, "Admin", resultID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setResult(docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }

    const subColRef = query(
      collection(db, "Admin", resultID, "candidates"),
      orderBy("NoOfVotes", "desc")
    );
    const querySnapshot = await getDocs(subColRef);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots

      setCompletedData(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
  }

  console.log(completedata);

  return (
    <div className=" ">
      <nav className="w-full h-24 flex px-5 items-center bg-gray-700 text-white justify-between">
        <h1 className="text-2xl">Add your Vote</h1>
        <div className="flex gap-5">
          {" "}
          <input
            onChange={(e) => setResultID(e.target.value)}
            required
            type="text"
            className="w-[300px] h-[30px] p-5 outline-none bg-gray-600"
            placeholder="Enter Election Id"
          />
          <input
            onClick={publish}
            className=" p-2 bg-green-400 text-gray-900"
            type="button"
            value="Find Result"
          />
        </div>

        <Link className="underline" to="/home">
          Add vote
        </Link>

        <button
          onClick={() => {
            history.push("/");
          }}
          className="bg-yellow-500 p-2"
        >
          Logout
        </button>
      </nav>

      <div className="container mx-auto">
        {result.Winner ? (
          <div>
            <h1 className="text-3xl mt-10 font-medium">
              {" "}
              The winner of the Election is{" "}
            </h1>

            <div className="w-full mt-6 text-white p-14 bg-[#222] flex flex-col gap-3 ">
              <div className="flex items-center gap-5">
                <h1 className="text-3xl">{result.Winner}</h1> |
                <h1 className="text-3xl">{result.Winner_Party}</h1>
              </div>

              <h1>Total Votes : {result.Winner_NoOfVotes}</h1>
            </div>
            <div className="mt-10 font-medium text-3xl">
              <div className="grid grid-cols-3 gap-10"></div>
            </div>

            <h1 className="text-2xl font-medium">vote info</h1>

            {completedata && (
              <div>
                {completedata.map((post) => {
                  return (
                    <div className="bg-[#333]  mt-5 p-10 rounded-md">
                      <h1 className="text-2xl text-gray-300">{post.Name}</h1>
                      <h1 className="text-2xl text-gray-300">{post.Party}</h1>
                      <p className="text-gray-400 my-6">
                        {" "}
                        Total votes :{post.NoOfVotes}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[80vh] justify-center items-center">
            <h1 className="text-4xl"> Result not published yet</h1>
          </div>
        )}
      </div>
    </div>
  );
}
