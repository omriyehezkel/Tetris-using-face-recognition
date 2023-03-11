function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
        let video = document.getElementById("cam_input"); // video is the id of video tag
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                console.log("An error occurred! " + err);
            });
        let eyeright_flag = 0;
        let eyeleft_flag = 0;
        let smile_flag = 0;
        let flag =0;
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(cam_input);
        let faces = new cv.RectVector();
        let eyes = new cv.RectVector();
        let smiles = new cv.RectVector();
        let lefteye = new cv.RectVector();
        let righteye = new cv.RectVector();
        let eyeC = new cv.CascadeClassifier();
        let SmileC = new cv.CascadeClassifier();
        let eyeleftC = new cv.CascadeClassifier();
        let eyerightC = new cv.CascadeClassifier();
        let faceC = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml';
        let eyesCascadeFile = 'haarcascade_eye.xml';
        let LeftEyesClosedCascadeFile = 'haarcascade_lefteye_2splits.xml';
        let RightEyesClosedCascadeFile = 'haarcascade_righteye_2splits.xml';
        let SmileCascadeFile = 'haarcascade_smile.xml';

        //     utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        //         faceC.load(faceCascadeFile); // in the callback, load the cascade from file 
        // });   
        utils.createFileFromUrl(eyesCascadeFile, eyesCascadeFile, () => {
            eyeC.load(eyesCascadeFile); // in the callback, load the cascade from file 
        });
        utils.createFileFromUrl(SmileCascadeFile, SmileCascadeFile, () => {
            SmileC.load(SmileCascadeFile); // in the callback, load the cascade from file 
        });

        utils.createFileFromUrl(LeftEyesClosedCascadeFile, LeftEyesClosedCascadeFile, () => {
            eyeleftC.load(LeftEyesClosedCascadeFile); // in the callback, load the cascade from file 
        });

        utils.createFileFromUrl(RightEyesClosedCascadeFile, RightEyesClosedCascadeFile, () => {
            eyerightC.load(RightEyesClosedCascadeFile); // in the callback, load the cascade from file 
        });


        const FPS = 30;
        let status = null;
        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            try {
                // faceC.detectMultiScale(gray, faces, 1.6, 3, 5);
             /*   eyeC.detectMultiScale(gray, eyes, 1.3, 15, 20);
                SmileC.detectMultiScale(gray, smiles, 1.6, 20, 25);
                eyeleftC.detectMultiScale(gray, lefteye, 1.6, 20, 25);
                eyerightC.detectMultiScale(gray, righteye, 1.6, 20, 25);
*/
                eyeC.detectMultiScale(gray, eyes, 1.3, 15, 20);
                SmileC.detectMultiScale(gray, smiles, 1.8, 20, 22);
                eyeleftC.detectMultiScale(gray, lefteye, 1.6, 20, 25);
                eyerightC.detectMultiScale(gray, righteye, 1.6, 20, 25);

                // console.log("eyes: "+eyes.size());
                // console.log("lefteye: "+lefteye.size());
                // // console.log("RIGHTeye: "+righteye.size());
                TetrisMovement(status);

                if (eyes.size() == 1 && lefteye.size() == 1 && righteye.size() == 0) {
                    eyeright_flag += 1;
                    if (eyeright_flag > 2) {
                        document.getElementById("face_status").innerHTML = "RIGHT EYE CLOSE" + "(" + eyeright_flag + ")";
                        status = "RIGHT EYE CLOSE";
                        eyeright_flag = 0;
                    }
                }

                if (eyes.size() == 1 && lefteye.size() == 0 && righteye.size() == 1) {
                    eyeleft_flag += 1;
                    if (eyeleft_flag > 2) {
                        document.getElementById("face_status").innerHTML = "LEFT EYE CLOSE" + "(" + eyeleft_flag + ")";
                        status = "LEFT EYE CLOSE";
                        eyeleft_flag = 0;
                    }
                }

                if (smiles.size() == 0) {
                    smile_flag += 1;
                    if (smile_flag > 3) {
                        flag=1;
                        console.log("MOUTH OPEN");
                        document.getElementById("face_status").innerHTML = "MOUTH OPEN" + "(" + smile_flag + ")";
                        if(flag == 1)
                        status = "MOUTH OPEN";
                        flag=0
                        smile_flag = 0;
                    }
                }


            } 
            catch (err) {
                console.log(err);
            }
            // for (let a = 0; a < faces.size(); ++a) {
            //     let face = faces.get(a);
            //     let point1 = new cv.Point(face.x, face.y);
            //     let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            //     cv.rectangle(dst, point1, point2, [255, 0, 0, 0]);

            // }

            for (let j = 0; j < eyes.size(); ++j) {
                let ey = eyes.get(j);
                let point1 = new cv.Point(ey.x, ey.y);
                let point2 = new cv.Point(ey.x + ey.width, ey.y + ey.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 0]);
            }

            for (let k = 0; k < smiles.size(); ++k) {
                let smile = smiles.get(k);
                let point1 = new cv.Point(smile.x, smile.y);
                let point2 = new cv.Point(smile.x + smile.width, smile.y + smile.height);
                cv.rectangle(dst, point1, point2, [255, 255, 0, 255]);
            }

            for (let l = 0; l < lefteye.size(); ++l) {
                let eyel = lefteye.get(l);
                let point1 = new cv.Point(eyel.x, eyel.y);
                let point2 = new cv.Point(eyel.x + eyel.width, eyel.y + eyel.height);
                cv.rectangle(dst, point1, point2, [255, 100, 255, 255]);
            }
            for (let i = 0; i < righteye.size(); ++i) {
                let eyer = righteye.get(i);
                let point1 = new cv.Point(eyer.x, eyer.y);
                let point2 = new cv.Point(eyer.x + eyer.width, eyer.y + eyer.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            }

            TetrisMovement(status);
            status=null;
            TetrisMovement(status);


            cv.imshow("canvas_output", dst);
            // schedule next one.
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);


        }
        document.getElementById("face_status").innerHTML = "empty" + "(" + smile_flag + ")";    
        status = "empty";

        // schedule first one.
        setTimeout(processVideo, 0);
    };
}