import HandSensor from './js/handSensor.js';
import Protobject from './js/protobject.js';

HandSensor.start(100, 2);
HandSensor.showPreview({
  top: 0,
  left: 0,
  width: 375,
  height: 375
});
HandSensor.flip(false);

HandSensor.onData((data) => {
    if (data.landmarks && data.landmarks[0] && data.landmarks[0][8]) {
        Protobject.send(data.landmarks[0][8]).to('main.js');
    }
});
