pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // Backend Config
        BACKEND_IMAGE = 'surya162/oyo-backend'
        
        // Frontend Config
        FRONTEND_IMAGE = 'surya162/oyo-frontend'
        
        // Shared Tag (keeps versions in sync)
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    echo "--- Building Backend: ${IMAGE_TAG} ---"
                    
                    // FIXED: Switch to 'backend' directory before building
                    dir('backend') {
                        sh "docker build -t $BACKEND_IMAGE:$IMAGE_TAG ."
                        sh "docker build -t $BACKEND_IMAGE:latest ."
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    echo "--- Building Frontend: ${IMAGE_TAG} ---"
                    // 'dir' changes the directory to 'frontend' for this step
                    dir('frontend') { 
                        sh "docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ."
                        sh "docker build -t $FRONTEND_IMAGE:latest ."
                    }
                }
            }
        }

        stage('Login & Push All') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        
                        // Push Backend
                        sh "docker push $BACKEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $BACKEND_IMAGE:latest"

                        // Push Frontend
                        sh "docker push $FRONTEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $FRONTEND_IMAGE:latest"
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                script {
                    echo "--- Deploying Version ${IMAGE_TAG} ---"
                    // We pass the single tag, Ansible applies it to both
                    sh "ansible-playbook deploy.yml --extra-vars 'image_tag=${IMAGE_TAG}'"
                }
            }
        }
    }
}