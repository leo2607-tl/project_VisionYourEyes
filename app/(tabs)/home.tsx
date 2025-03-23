import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Button, Image, TouchableOpacity, Alert, Animated, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../constant/Colors';
import { useFonts } from 'expo-font';

const Home = () => {
  const [loaded, error] = useFonts({
    'CW': require('../../assets/fonts/CloudWorld.ttf'),
    'GA': require('../../assets/fonts/GA.otf'),
    'QL': require('../../assets/fonts/QL.ttf'),
    'TNR': require('../../assets/fonts/TNR.ttf'),
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [caption, setCaption] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    backfaceVisibility: 'hidden' as 'hidden',
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    backfaceVisibility: 'hidden' as 'hidden',
    position: 'absolute' as const,
  };

  const flipCard = async () => {
    if (!audioUri || !caption) {
      Alert.alert('Chưa có audio & caption', 'Vui lòng gửi ảnh để tạo audio và caption trước.');
      return;
    }
    if (!isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 800,
        useNativeDriver: true,
      }).start();
      playAudio();
    } else {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        } catch (error) {
          console.error("Error stopping audio:", error);
        }
      }
    }
    setIsFlipped(!isFlipped);
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const imageBlob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
    return base64.split(',')[1];
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert('Không có ảnh nào được chọn');
      return;
    }

    setImageUri(result.assets[0].uri);
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert('Lỗi: Không có ảnh nào được chụp');
      return;
    }

    setImageUri(result.assets[0].uri);
  };

  const playAudio = async () => {
    if (audioUri) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      setSound(sound);
    }
  };

  const handleSendImage = async () => {
    if (imageUri) {
      const base64Image = await convertImageToBase64(imageUri);
      await sendImageToApi(base64Image);
    } else {
      Alert.alert('No Image', 'Please select an image first');
    }
  };

  const sendImageToApi = async (base64Image: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.siu.edu.vn/retrieval_system_10/image2speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio file');
      }

      const json = await response.json();
      const { caption: apiCaption, audio } = json;
      setCaption(apiCaption);

      const audioPath = FileSystem.documentDirectory + 'audio.mp3';
      await FileSystem.writeAsStringAsync(audioPath, audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setAudioUri(audioPath);

      // Show the popup after processing
      setShowPopup(true);

      // Automatically hide the popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
          setSound(null);
        }
      };
    }, [sound])
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.bluesad }]}>

        {showPopup && (
          <View
            style={[
              tw`absolute bg-opacity-90 flex-1 justify-center items-center`,
              {
                backgroundColor: Colors.bluesad,
                zIndex: 100,
                width: '100%', 
                height: '100%',
                borderRadius: 10,
              },
            ]}
          >
            <Text style={[{ fontSize: 40, fontFamily: 'TNR', color: Colors.black }]}>Xử lý xong!</Text>
            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={[tw`mt-2`, { backgroundColor: Colors.ored, padding: 10, borderRadius: 10 }]}
            >
              <Text style={[tw`text-white`, { fontSize: 36 }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        )}

      <Text style={[tw`text-center `, { fontFamily: "GA", color: Colors.ored, fontSize: 60 }]}>V Y E</Text>
      <TouchableOpacity
        style={[
          tw`justify-center items-center overflow-hidden`,
          {
            height: '80%',
            width: '99%',
            backgroundColor: Colors.light,
            borderRadius: 20,
            alignSelf: 'center',
            marginTop: 5,
          },
        ]}
        onPress={flipCard}
        activeOpacity={0.9}
      >
        <View style={tw`flex-1 justify-center items-center`}>
          <Animated.View style={[tw`absolute w-full h-full justify-center items-center`, frontAnimatedStyle]}>
            {imageUri ? (
              <View style={tw`w-full h-full justify-center items-center p-4`}>
                <Image source={{ uri: imageUri }} style={tw`w-full h-full object-contain`} />
              </View>
            ) : (
              <Text style={tw`text-gray-500 text-center`}>Chưa có ảnh nào được chọn</Text>
            )}
          </Animated.View>
          <Animated.View style={[tw`absolute w-full h-full justify-center items-center`, backAnimatedStyle]}>
            <View style={[tw`w-full h-full justify-start items-center p-2 `, { backgroundColor: Colors.grey }]}>
              <Text style={[tw`text-start mb-5 mt-10`, {fontSize: 35, fontFamily: "CW", color: Colors.ored}]}>DESCRIPTION</Text>
              <Text style={[tw`text-white text-start ml-4`, {fontSize: 28, fontFamily: "TNR"}]}>{caption || 'Đang tải caption...'}</Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>

      <View style={[tw`flex-1 justify-end`, { width: '97%', alignSelf: 'center' }]}>
        <View style={[tw`flex-row w-full`, { height: '85%', justifyContent: 'space-between' }]}>
          <TouchableOpacity
            style={[
              tw`flex-1 justify-center items-center`,
              { backgroundColor: Colors.cam, height: '100%', borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
            ]}
            onPress={pickImage}
            disabled={isLoading}
          >
            <Text style={[tw`text-white`, { fontSize: 24, fontFamily: "CW" }]}>CHỌN ẢNH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw`flex-1 justify-center items-center`,
              { backgroundColor:  Colors.cam, height: '100%'},
            ]}
            onPress={handleSendImage}
            disabled={isLoading}
          >
            <Text style={[tw`text-white`, { fontSize: 24, fontFamily: "CW" }]}>
              {isLoading ? 'ĐANG GỬI...' : 'GỬI ẢNH'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw`flex-1 justify-center items-center`,
              { backgroundColor:  Colors.cam, height: '100%', borderTopRightRadius: 30, borderBottomRightRadius: 30 },
            ]}
            onPress={takePicture}
            disabled={isLoading}
          >
            <Text style={[tw`text-white`, { fontSize: 24, fontFamily: "CW"}]}>CHỤP ẢNH</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Home;
