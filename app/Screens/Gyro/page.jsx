import GyroView from '@/components/GyroView';
import { Text, View } from 'react-native';

    const App = () => {
      return (
        <GyroView>
          <View style={{ width: 100, height: 100, backgroundColor: 'blue' }}>
            <Text style={{ color: 'white' }}>Rotate Me!</Text>
          </View>
        </GyroView>
      );
    };

    export default App;
