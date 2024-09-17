import "./App.css";
import React, { useState } from "react";
import { SecureJS } from "@todak2000/securejs";

const App: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("symmetric");

  // Symmetric encryption state
  const [symmetricMessage, setSymmetricMessage] = useState("");
  const [symmetricKey, setSymmetricKey] = useState<CryptoKey | null>(null);
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");

  // Asymmetric cryptography state
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [asymmetricMessage, setAsymmetricMessage] = useState("");
  const [signature, setSignature] = useState("");

  const handleGenerateKey = async () => {
    const generatedKey = await SecureJS.generateEncryptionKey();
    setSymmetricKey(generatedKey);
  };

  const handleEncryptMessage = async () => {
    if (symmetricKey && symmetricMessage) {
      const encrypted = await SecureJS.encrypt(symmetricMessage, symmetricKey);
      setEncryptedMessage(encrypted);
    }
  };

  const handleDecryptMessage = async () => {
    if (symmetricKey && encryptedMessage) {
      const decrypted = await SecureJS.decrypt(encryptedMessage, symmetricKey);
      setDecryptedMessage(decrypted);
    }
  };

  const handleGenerateKeyPair = async () => {
    const newKeyPair = await SecureJS.generateKeyPair();
    setKeyPair(newKeyPair);
  };

  const handleEncrypt = async () => {
    if (!keyPair) {
      alert("Please generate a key pair first");
      return;
    }
    const messageBuffer = new TextEncoder().encode(asymmetricMessage);
    const newSignature = await SecureJS.sign(messageBuffer, keyPair.privateKey);
    setSignature(
      btoa(String.fromCharCode(...Array.from(new Uint8Array(newSignature))))
    ); // Convert ArrayBuffer to regular array
  };

  const handleDecrypt = async () => {
    if (!keyPair || !signature) {
      alert("Please generate a key pair and sign a message first");
      return;
    }
    const signatureBuffer = Uint8Array.from(atob(signature), (c) =>
      c.charCodeAt(0)
    );
    const messageBuffer = new TextEncoder().encode(asymmetricMessage);
    const isValid = await SecureJS.verify(
      signatureBuffer,
      messageBuffer,
      keyPair.publicKey
    );
    setDecryptedMessage(isValid ? asymmetricMessage : "Verification failed");
  };

  return (
    <div className="app-container">
      <h1>SecureJS Demo</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "symmetric" ? "active" : ""}`}
          onClick={() => setActiveTab("symmetric")}
        >
          Symmetric Encryption
        </button>
        <button
          className={`tab-button ${activeTab === "asymmetric" ? "active" : ""}`}
          onClick={() => setActiveTab("asymmetric")}
        >
          Asymmetric Cryptography
        </button>
        <button
          className={`tab-button ${activeTab === "hashing" ? "active" : ""}`}
          onClick={() => setActiveTab("hashing")}
        >
          Password Hashing
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "symmetric" && (
          <div>
            <h2>Symmetric Encryption</h2>
            <textarea
              placeholder="Enter message (min 3 chars)"
              value={symmetricMessage}
              onChange={(e) => setSymmetricMessage(e.target.value)}
            />
            <button
              onClick={handleGenerateKey}
              disabled={symmetricMessage.length < 3}
              className={symmetricMessage.length < 3 ? "disabled-button" : ""}
            >
              Generate Encryption Key
            </button>
            {symmetricKey && (
              <div>
                <button
                  onClick={handleEncryptMessage}
                  disabled={!symmetricMessage}
                  className={!symmetricMessage ? "disabled-button" : ""}
                >
                  Encrypt Message
                </button>
                {encryptedMessage && (
                  <p>Encrypted Message: {encryptedMessage}</p>
                )}
                <button
                  onClick={handleDecryptMessage}
                  disabled={!encryptedMessage}
                  className={!encryptedMessage ? "disabled-button" : ""}
                >
                  Decrypt Message
                </button>
                {decryptedMessage && (
                  <p>Decrypted Message: {decryptedMessage}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "asymmetric" && (
          <div>
            <h2>Asymmetric Cryptography</h2>
            
            <input
              type="text"
              value={asymmetricMessage}
              onChange={(e) => setAsymmetricMessage(e.target.value)}
              placeholder="Enter message to sign"
            />
            <button
              onClick={handleGenerateKeyPair}
              disabled={keyPair !== null || asymmetricMessage===''}
              className={keyPair !== null || asymmetricMessage==='' ? "disabled-button" : ""}
            >
              Generate Key Pair
            </button>
            <p>Key Pair Status: {keyPair ? "Generated" : "Not Generated. Enter your message to generate one"}</p>
            {keyPair && (
              <div>
                <button
                  onClick={handleEncrypt}
                  disabled={!keyPair || asymmetricMessage.length < 3}
                  className={
                    !keyPair || asymmetricMessage.length < 3
                      ? "disabled-button"
                      : ""
                  }
                >
                  Sign
                </button>

                {signature && (
                  <>
                    <p>Signature: {signature}</p>
                    <button
                      onClick={handleDecrypt}
                      disabled={!signature}
                      className={!signature ? "disabled-button" : ""}
                    >
                      Verify
                    </button>
                    {decryptedMessage && (
                      <p>Verification Result: {decryptedMessage}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "hashing" && (
          <div>
            <h2>Password Hashing</h2>
            <p>
              The secureJS library uses the Argon2 hashing algorithm, which
              relies on native modules available only in server environments
              (like Node.js). Modern browsers do not support these native
              modules for security and performance reasons. This means that any
              attempt to call the hash function of the secureJS library directly
              in your browser will result in an error. <br />
              To securely hash data, especially sensitive information like
              passwords, you must handle this operation on the server. You can
              send the data from the client (browser) to the server, where it
              will be securely hashed, and then return the result if needed.
              Here’s how you can implement this in a Node.js environment:
            </p>
            <ul>
              <li>
                Install the secureJS library (or ensure it’s available if
                already built).
              </li>
              <li>
                Handle the hashing on the server and send the result back to the
                client if necessary.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
