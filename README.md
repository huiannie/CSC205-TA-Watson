# Conversational Agent: CSC205 TA Watson

This is a simple starter template for CSC205 students who want to start building an intelligent 
Q&A agent for CSC205.

Source: This template is modified from <it> Watson's conversational agent starter kit </it> (see https://github.com/watson-developer-cloud/conversational-agent-application-starter-kit) 
provided by IBM under the Apache2 license. 

Students interested in using this template to build the TA (teaching assistant) for CSC205 may use 
the <it>Watson's conversational agent starter kit </it> as a warmup before starting on this project.

### How it works

The project has 3 main components: the server (written in node.js), the watson classifier service, 
and the watson dialog service.

Both the classifier service and the dialog service requires training/customization before they 
can be used. 
Once this is done, these services are fully funcational for the rest of the lifespan of the 
application (unless the conversation content needs to be modified).

When a user sends in a text input, the server submits the text input to the classifier service 
to acquire a classification for the text. The classifier provide two possible classes with 
confidence level. 

Next, the server submits the classification result along with the original text input to the 
dialog service. To provide the classification result to the dialog, the server updates the 
profile of the dialog based on the classes computed by the classifier.


### Services needed

The two Watson services required by this application are the Classifier and the Dialog.
These two services must be added to the Bluemix account prior to development. 
Details on how to set up these services may be found in the 
<it>Watson's conversational agent starter kit </it>.

In order for the application to bind to the services, the two services must be named that 
match the service names listed in the `manifest.yml` file. 
So the dialog service should be named <it>dialog-service</it> 
and the classifier service should be named <it>natural-language-classifier-service</it>


### How to train the classifier

The classifier needs to be trained with designated data. A sample data file for training the 
classifier may be found in `training/classifier_training.csv`. 

In the development phase, it is possible to train the classifier separately for test purpose. 
Details on how to do this may be found at the following links: 
- https://github.com/watson-developer-cloud/natural-language-classifier-nodejs
- https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/get_start.shtml
- https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/natural-language-classifier/api/v1/

A sample unix shell script for managing the classifer instances using curl may be found in `training/shell_scripts/train205.script`.

Once a classifier has been satisfactorily developed and trained, its classifier id may be saved 
manually in the `training/classifier_id` so that this classifier may be used permanently.


### How to write the dialog script

The dialog script must be customized for the specific subject matter. 
The syntax of the dialog script may be found from the Watson website at: 
https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/dialog/tutorial_tutorials.shtml

Examples of dialog features may be found in the folder named `training/dialog_examples/`.

This demo uses the sample dialog script provided in `training/dialog_and_classifier.xml`. 
In this script, the classifier's results are saved as profile variables. 
The profile variables to be used for redirecting the search tree to better locate 
branches of conversation that are relevant to the topic being asked.

In the development phase, 

- the dialog scripts may be tested using the dialog tool available for installation 
at: https://github.com/watson-developer-cloud/dialog-tool 
- the communication with a dialog instance may also be done using curl. For this purpose, 
a sample unix shell script may be found at `training/shell_scripts/converse.script`
- the dialogs may be managed using curl from the terminal. A sample shell shell for 
managing the dialogs may be found in `training/shell_scripts/dialog205.script`

Once the dialog script has been satisfactorily developed, its dialog_id may be saved manually 
in the `training/dialog_id` so that this dialog may be used permanently. 

