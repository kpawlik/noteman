package main

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"io"
)

func encrypt(txt, pswd string) (out []byte, err error) {
	var (
		block    cipher.Block
		iv       [aes.BlockSize]byte
		outBytes []byte
	)
	key := formatKey(pswd)
	inBuff := bytes.NewReader([]byte(txt))
	outBuff := bytes.NewBuffer(outBytes)
	if block, err = aes.NewCipher(key); err != nil {
		return
	}
	stream := cipher.NewOFB(block, iv[:])
	writer := &cipher.StreamWriter{S: stream, W: outBuff}
	if _, err = io.Copy(writer, inBuff); err != nil {
		return
	}
	out = outBuff.Bytes()
	return
}

func decrypt(data []byte, pswd string) (out string, err error) {
	var (
		block    cipher.Block
		iv       [aes.BlockSize]byte
		outBytes []byte
	)
	key := formatKey(pswd)
	if block, err = aes.NewCipher(key); err != nil {
		return
	}
	inBuff := bytes.NewBuffer(data)
	outBuff := bytes.NewBuffer(outBytes)
	stream := cipher.NewOFB(block, iv[:])
	reader := &cipher.StreamReader{S: stream, R: inBuff}
	if _, err = io.Copy(outBuff, reader); err != nil {
		return
	}
	out = string(outBuff.String())
	return
}

func formatKey(sKey string) []byte {
	key := []byte(sKey)
	rst := 16 - (len(key) % 16)
	if rst == 0 {
		return key
	}
	app := make([]byte, rst)
	return append(key, app...)
}

func changePswd(oldpswd, newpswd string, data []byte) (out []byte, err error) {
	strData, err := decrypt(data, oldpswd)
	if err != nil {
		return
	}
	return encrypt(strData, newpswd)
}
