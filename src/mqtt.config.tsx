import mqtt from 'mqtt';

// Helper function to load certificate as a string
const loadCertificate = async (path: string): Promise<string> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load certificate from ${path}`);
  }
  return response.text();
};

// MQTT setup
const setupMQTT = async () => {
  try {
    // Dynamically fetch certificates from public directory
    const clientCert = await loadCertificate('/certificates/demo-mqtt-client-authn-ID.pem');
    const clientKey = await loadCertificate('/certificates/demo-mqtt-client-authn-ID.key');

    const mqttConfigOptions = {
      protocol: 'wss', // Secure WebSocket protocol
      host: 'demo-mqtt-dev.eastus-1.ts.eventgrid.azure.net',
      port: 443, // Port for secure WebSocket
      username: 'demo-mqtt-client-authn-ID',
      password: '', // Add password if required
      cert: clientCert,
      key: clientKey,
      reconnectPeriod: 15000, // Reconnect interval in ms
      path: '/mqtt', // Path, if required by the broker
    };

    // Connect to the MQTT broker
    const mqttClient = mqtt.connect(mqttConfigOptions);

    // Connection event handlers
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    mqttClient.on('offline', () => {
      console.log('MQTT broker is currently offline');
    });

    mqttClient.on('reconnect', () => {
      console.log('Reconnecting to MQTT broker...');
    });

    mqttClient.on('error', (error) => {
      console.error('MQTT Connection Error:', error.message);
    });

    mqttClient.on('close', () => {
      console.log('MQTT Connection Closed');
    });

    // Export subscription and publish functionality
    return {
      subscribe: (topics: string[]) => {
        if (!topics.length) {
          console.error('No topics provided for subscription');
          return;
        }

        mqttClient.subscribe(topics, (error, granted) => {
          if (error) console.error('Failed to subscribe to MQTT Topic: ', error);
          else console.log('Successfully subscribed: ', granted);
        });
      },
      publish: (topic: string, message: string) => {
        if (!topic || !message) {
          console.error('Topic and message are required to publish');
          return;
        }

        const options = {
          retain: true,
        };

        mqttClient.publish(topic, message, options, (error) => {
          if (error) console.error('Failed to publish to topic - ', topic);
          else console.log(`Topic - ${topic} is published with message - ${message}`);
        });
      },
    };
  } catch (error) {
    console.error('Failed to initialize MQTT client:', error);
  }
};

// **Add subscribe to exports list**
export default setupMQTT;