import React from 'react';
import { View } from 'react-native';
//import { WebView } from 'react-native-webview';
const page = () => {
  return (
    <View style={{ height: 100 }}>
        {/* <WebView
            originWhitelist={['*']}
            scrollEnabled={false}
            source={{
            html: `
                <html>
                <head>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
                    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
                </head>
                <body>
                    <div id="math"></div>
                    <script>
                    document.getElementById('math').innerHTML = katex.renderToString(String.raw\`A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}\`, { displayMode: true });
                    </script>
                </body>
                </html>
            `
            }}
            style={{ backgroundColor: 'transparent' }}
        /> */}
        </View>
        )
    }

export default page