# WebServer-Creation
This project is intended to build a WebServer which exposes the desired JSON objects from 8090 port. It also returns "OK" message under "/api/healthcheck" path for kubernetes healthcheck purposes. Here are the step-by-step guide to build and run the docker image, push it to DockerHub and run the container in kubernetes.

1- Docker needs to be installed in host machine to build, run, tag and push the image to container registry. Follow the steps in below document to install Docker according to your OS.

https://docs.docker.com/engine/install/

2- Go to the root of the project and run the below command to build the Docker image.

```
docker build . -t webserver/node-web-app
```

3- Run the below command to run the Docker container for testing purposes. Then you may visit "localhost:8080" to see the JSON content.

```
docker run -p 8080:8090 -d webserver/node-web-app
```

4- Run the below command to grab the image ID of our docker container.

```
docker image ls
```

5- Run the below command to tag the image as "v1". This step is needed in order to push to image to the Docker registry.

```
docker tag <image-id> <your-dockerhub-username>/node-web-app:v1
```

6- Run the below command to login into DockerHub. It will prompt you the enter your DockerHub username and password.

```
docker login
```

7- Run the below command to finally push the image into Docker registry.

 ```
docker push <your-dockerhub-username>/node-web-app:v1
```

8- "kubectl" command line utility needs to be installed in order to interact with your Kubernetes cluster. Install "kubectl" according to below document and login to your Kubernetes cluster.

https://kubernetes.io/docs/tasks/tools/

8- Now we will use Kubernetes secret resource to establish communication between our kubernetes cluster and Docker registry. Run the below command to create the secret which we will use in our YAML file later.

 ```
kubectl create secret docker-registry regcred --docker-server=<your-registry-server> --docker-username=<your-username> --docker-password=<your-password> --docker-email=<your-email>
```

9- Open the "deployment.yaml" file in root of the project and edit the image URL (line 26). Your docker registry URL needs to be entered.

10- Before deploying the application, we will first inject MongoDB to our kubernetes cluster. We will start with creating a Persistent Volume.

```
kubectl apply -f mongo-db-pv.yaml
```

11- Now it's time to request a Persistent Volume Claim.

```
kubectl apply -f mongo-db-pvc.yaml
```

12- We will inject our secret which will have our credentials for logging in to MongoDB. This step is required to place the desired JSON into MongoDB.

```
kubectl apply -f mongo-db-secret.yaml
```

13- We're all set to deploy our MongoDB container into kubernetes. Run the following command the create MongoDB deployment in default namespace.

```
kubectl apply -f mongo-db-deployment.yaml
```

14- As final step for MongoDB process, we will create the service of it. Service type will be equal to "ClusterIP" so that it'll be only reacable within Kubernetes cluster. The webserver will connect to MongoDB from it's private kubernetes cluster URL. (in this case it's mongo.default.svc.cluster.local:27017)

```
kubectl apply -f mongo-db-service.yaml
```

16- Now we will connect to our DB, create database and collection. Run the below command to route the kubernetes MongoDB service traffic to your localhost. Then use your favourite DB connector application and use "localhost:27017" as domain, username and password from kubernetes secret. Database name will be "mymongo" and collection name will be "jsonTestCollection".

```
kubectl port-forward svc/mongo 27017:27017
```

15- Assuming that you are still in the root of the project, as final steps we will apply the webserver Kubernetes YAML files. These YAML files will create a Deployment and Service resources of webserver in default namespace. It'll create 2 pods of webserver exactly defined in the task definition.

```
kubectl apply -f webserver-deployment.yaml
```

```
kubectl apply -f webserver-service.yaml
```

16- As last step just run the below command. You'll see a public IP next to webserver service. Navigate to that IP with HTTP and you will see the content.

```
kubectl get svc
```

Navigate to Postman with public-IP:80/api/insertData to insert your desired data to DB.
 
Navigate to your browser with public-IP:80/api/getData to get the inserted data.
