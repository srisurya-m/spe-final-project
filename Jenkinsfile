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
                    echo "--- Building Frontend: ${IMAGE_TAG} with Secrets ---"
                    dir('frontend') { 
                        // Wrap the build in withCredentials to access the secrets
                        withCredentials([
                            string(credentialsId: 'FIREBASE_API_KEY', variable: 'API_KEY'),
                            string(credentialsId: 'FIREBASE_AUTH_DOMAIN', variable: 'AUTH_DOMAIN'),
                            string(credentialsId: 'FIREBASE_PROJECT_ID', variable: 'PROJECT_ID'),
                            string(credentialsId: 'FIREBASE_STORAGE_BUCKET', variable: 'STORAGE_BUCKET'),
                            string(credentialsId: 'FIREBASE_MESSAGING_SENDER_ID', variable: 'SENDER_ID'),
                            string(credentialsId: 'FIREBASE_APP_ID', variable: 'APP_ID')
                        ]) {
                            sh """
                                docker build \
                                --build-arg VITE_API_KEY=${API_KEY} \
                                --build-arg VITE_AUTH_DOMAIN=${AUTH_DOMAIN} \
                                --build-arg VITE_PROJECT_ID=${PROJECT_ID} \
                                --build-arg VITE_STORAGE_BUCKET=${STORAGE_BUCKET} \
                                --build-arg VITE_MESSAGING_SENDER_ID=${SENDER_ID} \
                                --build-arg VITE_APP_ID=${APP_ID} \
                                -t $FRONTEND_IMAGE:$IMAGE_TAG .
                            """
                        }
                        // Tag latest outside the secret block (optional, but cleaner)
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