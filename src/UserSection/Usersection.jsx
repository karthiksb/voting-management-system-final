import React from "react";
import Publish from "./Publish";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { app, db } from "../firebase";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";

export default function Usersection() {
  const auth = getAuth();
  const history = useHistory();
  const [data, setData] = useState([]);
  const [dataloaded, setdataloaded] = useState();
  const [electionId, setElectionID] = useState();
  const [electionId2, setElectionID2] = useState();
  const [classna, setclass] = useState("bg-[#333]  mt-5 p-10 rounded-md");
  const [voteAdded, isVoteAdded] = useState(false);
  const [selectedData, setSelectedData] = useState(false);

  const [uid, setUid] = useState();

  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    try {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUid(user);
        } else {
          console.log("log out");
        }
      });
    } catch (err) {}
    async function userdata() {
      const docRef = doc(db, "user", uid.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }

    userdata();
  }, [uid]);

  async function FindElection() {
    const subColRef = collection(db, "Admin", electionId, "candidates");
    const querySnapshot = await getDocs(subColRef);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots

      setData(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setElectionID(null);
      setdataloaded(true);
    });
    if (currentUser[electionId2] === "yes") {
      isVoteAdded(true);
    } else {
      isVoteAdded(false);
    }
  }

  async function addVote() {
    const docRef = doc(db, "Admin", electionId2, "candidates", selectedData.id);

    setDoc(docRef, {
      NoOfVotes: parseInt(selectedData.NoOfVotes + 1),
      Name: selectedData.Name,
      Party: selectedData.Party,
    });

    setDoc(
      doc(db, "user", uid.uid),
      {
        name: uid.displayName,
        email: uid.email,
        [electionId2]: "yes",
      },
      { merge: true }
    );

    isVoteAdded(true);
    setSelectedData(false);
    toast.success("vote added successfully");
  }

  function select(post) {
    if (voteAdded === false) {
      setSelectedData(post);
    }
  }

  console.log(selectedData.id);

  return (
    <div>
      <ToastContainer />
      <Router>
        <Switch>
          <Route exact path="/home">
            <nav className="w-full h-24 flex px-5 items-center bg-gray-700 text-white justify-between">
              <h1 className="text-2xl">Add your Vote</h1>
              <div className="flex gap-5">
                {" "}
                <input
                  required
                  type="text"
                  onChange={(e) => {
                    setElectionID(e.target.value);
                    setElectionID2(e.target.value);
                  }}
                  className="w-[300px] h-[30px] p-5 outline-none bg-gray-600"
                  placeholder="Enter Election Id"
                />
                <input
                  onClick={FindElection}
                  className=" p-2 bg-green-400 text-gray-900"
                  type="button"
                  value="Find Election"
                />
              </div>

              <h1
                className="underline"
                onClick={() => history.push("/publish")}
              >
                Find Result
              </h1>

              <button
                onClick={() => {
                  signOut(auth)
                    .then(() => {
                      history.push("/");
                    })
                    .catch((error) => {
                      // An error happened.
                    });
                }}
                className="bg-yellow-500 p-2"
              >
                Logout
              </button>
            </nav>
            <div className="container mx-auto">
              {data && (
                <div>
                  {dataloaded && (
                    <div>
                      {currentUser[electionId2] && (
                        <div className="w-full h-12 bg-yellow-400 flex items-center px-5">
                          <h1>You are already voted</h1>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-10">
                {data.map((post) => {
                  return (
                    <div
                      onClick={() => {
                        select(post);
                        setclass("bg-[#333]  mt-5 p-10 rounded-md");
                      }}
                      className={classna}
                    >
                      <h1 className="text-2xl text-gray-300">{post.Name}</h1>
                      <h1 className="text-2xl text-gray-300">{post.Party}</h1>
                      <p className="text-gray-400 my-6">{post.Party}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedData && (
              <div className="container mx-auto py-10 flex flex-col items-center gap-10">
                <h1 className="text-2xl">
                  Do you want to vote for {selectedData.Name}
                </h1>
                <button className="w-full bg-green-400 h-10" onClick={addVote}>
                  Add Vote
                </button>
              </div>
            )}
          </Route>

          <Route exact path="/publish">
            <Publish electionId={electionId2} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
