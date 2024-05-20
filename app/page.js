"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDoc, deleteDoc, query, where, onSnapshot, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from './firebase';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [total, setTotal] = useState(0);
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loginPopup, setLoginPopup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [signup, setSignup] = useState(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
      setLoginPopup(false);
    } else {
      setCurrentUser(null);
    }
  });

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let itemsArr = [];
        querySnapshot.forEach((doc) => {
          itemsArr.push({ ...doc.data(), id: doc.id });
        });
        setItems(itemsArr);

        // read total from itemsArr
        const calculateTotal = () => {
          const totalPrice = itemsArr.reduce((sum, item) => sum + parseFloat(item.price), 0);
          setTotal(totalPrice);
        };
        calculateTotal();
      });
      return unsubscribe;
    }
  }, [currentUser]);

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.price !== '') {
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        price: newItem.price,
        userId: currentUser.uid,
      });
      setNewItem({ name: '', price: '' });
    }
  };

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  // Sign in with email and password
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  // Sign up with email and password
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignup(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Sign out
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl p-4 text-center">
          Expense Tracker
        </h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="grid grid-cols-6 items-center text-black">
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="span col-span-3 p-3 border"
              type="text"
              placeholder="Enter Item"
            />
            <input
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="span col-span-2 p-3 border mx-3 text-center"
              type="number"
              placeholder="Enter Price"
            />
            <button
              onClick={addItem}
              className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl"
              type="submit"
            >
              +
            </button>
          </form>
          <ul>
            {items.map((item, id) => (
              <li key={id} className="my-4 w-full flex justify-between bg-slate-950">
                <div className="p-4 w-full flex justify-between">
                  <span className="capitalize text-white">{item.name}</span>
                  <span className="text-white">${item.price}</span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16 text-white"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? (
            ''
          ) : (
            <div className="flex justify-between p-3 text-white">
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>
        {currentUser ? (
          <button onClick={handleLogout} className="bg-slate-800 p-3 text-white">
            Logout
          </button>
        ) : (
          <div>
            {loginPopup && (
              <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex justify-center">
                <div className="bg-white p-4 rounded-lg w-1/2">
                  <h2 className="text-2xl">Login/Signup</h2>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  <form onSubmit={signup ? handleSignup : handleLogin}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full p-2 mb-2"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full p-2 mb-2"
                    />
                    <button
                      type="submit"
                      className="w-full p-2 bg-blue-500 text-white"
                    >
                      {signup ? 'Signup' : 'Login'}
                    </button>
                    <p className="text-center mt-2">
                      {signup ? 'Already have an account?' : "Don't have an account?"}
                      <button
                        onClick={() => setSignup(!signup)}
                        className="text-blue-500 underline ml-1"
                      >
                        {signup ? 'Login' : 'Signup'}
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            )}
            <button
              onClick={() => setLoginPopup(true)}
              className="bg-slate-800 p-3 text-white"
            >
              Login/Signup
            </button>
          </div>
        )}
      </div>
    </main>
  );
}