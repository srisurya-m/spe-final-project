pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        VAULT_CREDENTIALS_ID  = 'ansible-vault-password'
        
        // Image Config
        BACKEND_IMAGE = 'surya162/oyo-backend'
        FRONTEND_IMAGE = 'surya162/oyo-frontend'
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
                        
                        sh "docker push $BACKEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $BACKEND_IMAGE:latest"

                        sh "docker push $FRONTEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $FRONTEND_IMAGE:latest"
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                script {
                    echo "--- Deploying Version ${IMAGE_TAG} with Ansible Vault ---"
                    
                    withCredentials([string(credentialsId: VAULT_CREDENTIALS_ID, variable: 'VAULT_PASS')]) {
                        
                        // 1. Create temporary password file
                        sh 'echo $VAULT_PASS > .vault_pass'
                        
                        // 2. Run Ansible using inventory.ini and vault password
                        sh """
                            ansible-playbook -i inventory.ini \
                            --vault-password-file .vault_pass \
                            deploy.yaml \
                            --extra-vars 'image_tag=${IMAGE_TAG}'
                        """
                        
                        // 3. Cleanup password file
                        sh 'rm .vault_pass'
                    }
                }
            }
        }
    }
}