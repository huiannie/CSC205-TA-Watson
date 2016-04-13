# Training

This folder contains the files that will be used to train the Dialog and Natural Language Classifier services.

Simple training data may be found in the files `dialog_and_classifier.xml` and `classifier_training.csv` in this folder.

Since a classifier takes a while to train, once it has been trained, you may save its id into the /training/classifier_id file so that it may be reused.

To run it locally you will need to specify the service credentials in `/.env.js` and delete the content of:
 * `/training/dialog_id`
 * `/training/classifier_id`



