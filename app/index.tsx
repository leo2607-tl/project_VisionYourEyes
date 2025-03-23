import React, { useEffect } from 'react';
import { Text, View, SafeAreaView, Dimensions, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import Colors from '../constant/Colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');
const aspectRatio = width / height; 

const isLaptop = aspectRatio > 1.6; 
const isMobile = !isLaptop;

const baseFontSize = isMobile ? 16 : 20;
const baseHeight = isMobile ? height * 0.4 : height * 0.3;

export default function Index() {

  const router = useRouter();

  const [loaded, error] = useFonts({
    'CW': require('../assets/fonts/CloudWorld.ttf'),
    'GA': require('../assets/fonts/GA.otf'),
    'QL': require('../assets/fonts/QL.ttf'),
    'TNR': require('../assets/fonts/TNR.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: Colors.white }]}>
      <View
        style={[
          tw`justify-center items-center`,
          { height: baseHeight },
          { backgroundColor: Colors.white },
        ]}
      >
        <Image
          source={require('../assets/images/landing_logo.png')}
          style={{
            width: width, 
            height: baseHeight,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={[tw`flex-1 items-center px-4 rounded-t-32px mt-2`, { backgroundColor: Colors.blue,}]}>
        <Text style={[tw`text-white text-center`, { fontSize: baseFontSize * 2, marginTop: height * 0.05, fontFamily: 'TNR',}]}>
        ✨Chào Mừng Bạn Đã Đến Với Vision Your Eyes✨ 
         
        </Text>
        <Text style={[tw`text-white text-center text-24px mt-4`, { fontFamily: 'TNR', fontSize: baseFontSize*1.4}]}>
        Ứng dụng mô tả hình ảnh cho người mù
        </Text>
        <Text style={[tw`text-white text-center text-24px mt-4`, { fontFamily: 'TNR', fontSize: baseFontSize}]}>
        ⠲⠥⠝⠛⠀⠙⠥⠝⠛⠀⠍⠕⠀⠹⠗⠁⠀⠓⠊⠝⠓⠀⠁⠝⠀⠉⠓⠊⠍⠀⠞⠊⠁
        </Text>
        <View style={[tw`w-full flex-row justify-evenly mt-12 mb-4 px-4`]}>
          <TouchableOpacity
            style={[tw`flex-1 mx-18 py-4 rounded-24px items-center`, { backgroundColor: 'white'}]}
            activeOpacity={0.3}
            onPress={() => {
              router.push('/(tabs)//home' as any); 
            }}
          >
            <Text style={[tw`text-black text-lg`, { fontFamily: 'TNR', fontSize: baseFontSize * 1.4}]}>Dùng Thử </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
